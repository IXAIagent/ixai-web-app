# V10.40 Workspace Membership

V10.40 adds a workspace membership foundation for future multi-user workspace roles.

The membership layer provides readiness metadata and role semantics for:

- owner
- admin
- editor
- viewer

It does not require `workspace_memberships` or `workspace_roles` tables to exist at runtime. Missing tables are reported as readiness gaps while current single-owner workspace behavior remains usable.

No membership management UI, auth behavior change, RLS change, schema migration, broker integration, trading logic, or AI recommendation logic is added.
