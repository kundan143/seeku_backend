ALTER TABLE public.menu_permission ADD COLUMN role_id INTEGER REFERENCES public.role_master(id);
UPDATE public.menu_permission mp SET role_id = um.role_id FROM public.users_master um WHERE um.id = mp.user_id;
ALTER TABLE public.menu_permission DROP COLUMN designation_id;

ALTER TABLE public.link_permission ADD COLUMN role_id INTEGER REFERENCES public.role_master(id);
UPDATE public.link_permission lp SET role_id = um.role_id FROM public.users_master um WHERE um.id = lp.user_id;
ALTER TABLE public.link_permission DROP COLUMN designation_id;
