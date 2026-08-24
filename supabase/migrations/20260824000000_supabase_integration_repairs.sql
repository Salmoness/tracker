-- Supabase Integration Repairs & Authoritative RPC Migration
-- Migration file: 20260824000000_supabase_integration_repairs.sql

-- 1. Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- Attach updated_at trigger to tables with updated_at
CREATE OR REPLACE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_routine_templates_updated_at
  BEFORE UPDATE ON public.routine_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_routine_template_items_updated_at
  BEFORE UPDATE ON public.routine_template_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_subtasks_updated_at
  BEFORE UPDATE ON public.subtasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_calendar_blocks_updated_at
  BEFORE UPDATE ON public.calendar_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_time_entries_updated_at
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_bill_payments_updated_at
  BEFORE UPDATE ON public.bill_payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Task completion timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_task_completion_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'completed' AND OLD.status = 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE OR REPLACE TRIGGER on_task_status_change
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_task_completion_timestamp();

-- 3. RPC: apply_daily_routine
CREATE OR REPLACE FUNCTION public.apply_daily_routine(
  p_template_id UUID,
  p_target_date DATE
)
RETURNS SETOF public.tasks
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_run_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  -- Check template ownership & active status
  IF NOT EXISTS (
    SELECT 1 FROM public.routine_templates
    WHERE id = p_template_id AND user_id = v_user_id AND archived_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Active routine template not found or access denied' USING ERRCODE = '22000';
  END IF;

  -- Idempotent check: return existing tasks if already run today
  SELECT id INTO v_run_id
  FROM public.daily_routine_runs
  WHERE routine_template_id = p_template_id AND target_date = p_target_date;

  IF v_run_id IS NOT NULL THEN
    RETURN QUERY
    SELECT * FROM public.tasks
    WHERE routine_run_id = v_run_id;
    RETURN;
  END IF;

  -- Create run record
  INSERT INTO public.daily_routine_runs (routine_template_id, user_id, target_date)
  VALUES (p_template_id, v_user_id, p_target_date)
  RETURNING id INTO v_run_id;

  -- Insert tasks snapshot from template items
  INSERT INTO public.tasks (
    user_id,
    category_id,
    title,
    description,
    priority,
    estimated_minutes,
    due_date,
    routine_run_id,
    routine_template_item_id,
    status
  )
  SELECT
    v_user_id,
    item.category_id,
    item.title,
    item.description,
    item.priority,
    item.estimated_minutes,
    p_target_date,
    v_run_id,
    item.id,
    'todo'
  FROM public.routine_template_items AS item
  WHERE item.routine_template_id = p_template_id
  ORDER BY item.position;

  RETURN QUERY
  SELECT * FROM public.tasks
  WHERE routine_run_id = v_run_id;
END;
$$;

-- 4. RPC: set_daily_priority
CREATE OR REPLACE FUNCTION public.set_daily_priority(
  p_task_id UUID,
  p_priority_date DATE,
  p_position SMALLINT
)
RETURNS SETOF public.daily_priorities
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_position < 1 OR p_position > 3 THEN
    RAISE EXCEPTION 'Position must be between 1 and 3' USING ERRCODE = '22003';
  END IF;

  -- Verify task ownership & status
  IF NOT EXISTS (
    SELECT 1 FROM public.tasks
    WHERE id = p_task_id AND user_id = v_user_id AND status != 'archived'
  ) THEN
    RAISE EXCEPTION 'Active task not found or access denied' USING ERRCODE = '22000';
  END IF;

  -- Remove existing entry if present for this date
  DELETE FROM public.daily_priorities
  WHERE user_id = v_user_id AND priority_date = p_priority_date AND task_id = p_task_id;

  -- Remove any task currently in the target slot
  DELETE FROM public.daily_priorities
  WHERE user_id = v_user_id AND priority_date = p_priority_date AND position = p_position;

  -- Insert new priority selection
  INSERT INTO public.daily_priorities (user_id, priority_date, task_id, position)
  VALUES (v_user_id, p_priority_date, p_task_id, p_position);

  RETURN QUERY
  SELECT * FROM public.daily_priorities
  WHERE user_id = v_user_id AND priority_date = p_priority_date
  ORDER BY position;
END;
$$;

-- 5. RPC: remove_daily_priority
CREATE OR REPLACE FUNCTION public.remove_daily_priority(
  p_task_id UUID,
  p_priority_date DATE
)
RETURNS SETOF public.daily_priorities
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.daily_priorities
  WHERE user_id = v_user_id AND priority_date = p_priority_date AND task_id = p_task_id;

  -- Re-compact remaining slots (1..N)
  WITH ordered AS (
    SELECT id, row_number() OVER (ORDER BY position) AS new_pos
    FROM public.daily_priorities
    WHERE user_id = v_user_id AND priority_date = p_priority_date
  )
  UPDATE public.daily_priorities AS dp
  SET position = ordered.new_pos::SMALLINT
  FROM ordered
  WHERE dp.id = ordered.id;

  RETURN QUERY
  SELECT * FROM public.daily_priorities
  WHERE user_id = v_user_id AND priority_date = p_priority_date
  ORDER BY position;
END;
$$;

-- 6. RPC: archive_task
CREATE OR REPLACE FUNCTION public.archive_task(p_task_id UUID)
RETURNS public.tasks
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_task public.tasks;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  -- Compact daily priorities for every date containing this task
  DELETE FROM public.daily_priorities
  WHERE user_id = v_user_id AND task_id = p_task_id;

  -- Update task status to archived
  UPDATE public.tasks
  SET status = 'archived', updated_at = NOW()
  WHERE id = p_task_id AND user_id = v_user_id
  RETURNING * INTO v_task;

  IF v_task.id IS NULL THEN
    RAISE EXCEPTION 'Task not found or access denied' USING ERRCODE = '22000';
  END IF;

  RETURN v_task;
END;
$$;

-- Permissions & Access Grants for MVP (RLS Bypass for single-owner private project)
-- As per supabase_integration_fixes.md, RLS is disabled for MVP single-tenant testing.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_template_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_routine_runs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_priorities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences DISABLE ROW LEVEL SECURITY;

-- Revoke table access from anon
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Grant required access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_daily_routine(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_daily_priority(UUID, DATE, SMALLINT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_daily_priority(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_task(UUID) TO authenticated;
