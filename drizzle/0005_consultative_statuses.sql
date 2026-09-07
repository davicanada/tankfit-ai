ALTER TABLE "demo_orders" DROP CONSTRAINT "demo_orders_status_check",
  ADD CONSTRAINT "demo_orders_status_check" CHECK ("status" IN ('draft', 'pending_approval', 'approved', 'changes_requested', 'rejected', 'accepted', 'paid', 'superseded'));
