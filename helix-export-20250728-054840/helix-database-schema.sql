--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: priority; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);


ALTER TYPE public.priority OWNER TO neondb_owner;

--
-- Name: status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.status OWNER TO neondb_owner;

--
-- Name: update_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.update_type AS ENUM (
    'guidance',
    'standard',
    'recall',
    'approval',
    'variation'
);


ALTER TYPE public.update_type OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: approvals; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.approvals (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    item_type character varying NOT NULL,
    item_id character varying NOT NULL,
    status public.status DEFAULT 'pending'::public.status,
    reviewer_id character varying,
    comments text,
    reviewed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.approvals OWNER TO neondb_owner;

--
-- Name: data_sources; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.data_sources (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    type character varying NOT NULL,
    endpoint text,
    is_active boolean DEFAULT true,
    last_sync_at timestamp without time zone,
    config_data jsonb,
    created_at timestamp without time zone DEFAULT now(),
    region character varying NOT NULL,
    country character varying,
    category character varying NOT NULL,
    language character varying DEFAULT 'en'::character varying,
    sync_frequency character varying DEFAULT 'daily'::character varying,
    metadata jsonb
);


ALTER TABLE public.data_sources OWNER TO neondb_owner;

--
-- Name: knowledge_base; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.knowledge_base (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    content text NOT NULL,
    category character varying,
    tags jsonb,
    created_by_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.knowledge_base OWNER TO neondb_owner;

--
-- Name: newsletters; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.newsletters (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    content text,
    html_content text,
    status public.status DEFAULT 'pending'::public.status,
    scheduled_for timestamp without time zone,
    sent_at timestamp without time zone,
    created_by_id character varying,
    subscriber_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.newsletters OWNER TO neondb_owner;

--
-- Name: regulatory_updates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.regulatory_updates (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    description text,
    source_id character varying,
    source_url text,
    region character varying NOT NULL,
    update_type public.update_type NOT NULL,
    priority public.priority DEFAULT 'medium'::public.priority,
    device_classes jsonb,
    categories jsonb,
    raw_data jsonb,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.regulatory_updates OWNER TO neondb_owner;

--
-- Name: subscribers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.subscribers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    name character varying,
    is_active boolean DEFAULT true,
    preferences jsonb,
    subscribed_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.subscribers OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    name character varying NOT NULL,
    role character varying DEFAULT 'viewer'::character varying NOT NULL,
    profile_image_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: approvals approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_pkey PRIMARY KEY (id);


--
-- Name: data_sources data_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.data_sources
    ADD CONSTRAINT data_sources_pkey PRIMARY KEY (id);


--
-- Name: knowledge_base knowledge_base_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_pkey PRIMARY KEY (id);


--
-- Name: newsletters newsletters_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.newsletters
    ADD CONSTRAINT newsletters_pkey PRIMARY KEY (id);


--
-- Name: regulatory_updates regulatory_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.regulatory_updates
    ADD CONSTRAINT regulatory_updates_pkey PRIMARY KEY (id);


--
-- Name: subscribers subscribers_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_email_unique UNIQUE (email);


--
-- Name: subscribers subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_regulatory_updates_priority; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_regulatory_updates_priority ON public.regulatory_updates USING btree (priority);


--
-- Name: idx_regulatory_updates_published; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_regulatory_updates_published ON public.regulatory_updates USING btree (published_at);


--
-- Name: idx_regulatory_updates_region; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_regulatory_updates_region ON public.regulatory_updates USING btree (region);


--
-- Name: approvals approvals_reviewer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_reviewer_id_users_id_fk FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: knowledge_base knowledge_base_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: newsletters newsletters_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.newsletters
    ADD CONSTRAINT newsletters_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: regulatory_updates regulatory_updates_source_id_data_sources_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.regulatory_updates
    ADD CONSTRAINT regulatory_updates_source_id_data_sources_id_fk FOREIGN KEY (source_id) REFERENCES public.data_sources(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

