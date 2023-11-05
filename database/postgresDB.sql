-- VENNT basic table definitions

CREATE SCHEMA vennt;

--------- META TABLES ---------

-- accounts

CREATE TABLE vennt.accounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username text NOT NULL UNIQUE,
    email text NOT NULL UNIQUE,
    password text NOT NULL,
    role text NOT NULL DEFAULT 'USER'::text
);

--------- CHARACTER SHEETS ---------

-- entities

CREATE TABLE vennt.entities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    owner uuid NOT NULL REFERENCES vennt.accounts(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text DEFAULT 'CHARACTER'::text,
    attributes jsonb,
    other_fields jsonb,
    public boolean NOT NULL DEFAULT false
);

-- items

CREATE TABLE vennt.items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_id uuid NOT NULL REFERENCES vennt.entities(id) ON DELETE CASCADE,
    name text NOT NULL,
    bulk integer NOT NULL DEFAULT 0,
    "desc" text,
    type text,
    custom_fields jsonb,
    uses jsonb,
    comment text,
    active boolean NOT NULL DEFAULT false
);

-- abilities

CREATE TABLE vennt.abilities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_id uuid NOT NULL REFERENCES vennt.entities(id) ON DELETE CASCADE,
    name text NOT NULL,
    effect text NOT NULL,
    custom_fields jsonb,
    uses jsonb,
    comment text,
    active boolean NOT NULL DEFAULT false
);

-- entity_changelog

CREATE TABLE vennt.attribute_changelog (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_id uuid NOT NULL REFERENCES vennt.entities(id) ON DELETE CASCADE,
    attr text NOT NULL,
    msg text,
    prev integer,
    time timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX entity_id_attr ON vennt.attribute_changelog(entity_id uuid_ops,attr text_ops);

-- entity_text

CREATE TABLE vennt.entity_text (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_id uuid NOT NULL REFERENCES vennt.entities(id) ON DELETE CASCADE,
    key text NOT NULL,
    text text NOT NULL,
    public boolean NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX entity_key_unique ON vennt.entity_text(entity_id uuid_ops,key text_ops);

-- flux

CREATE TABLE vennt.flux (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_id uuid NOT NULL REFERENCES vennt.entities(id) ON DELETE CASCADE,
    type text NOT NULL,
    text text NOT NULL,
    metadata jsonb
);

--------- CAMPAIGNS ---------

-- campaigns

CREATE TABLE vennt.campaigns (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    in_combat boolean NOT NULL DEFAULT false,
    init_index integer NOT NULL DEFAULT 0,
    init_round integer NOT NULL DEFAULT 0,
    "desc" text NOT NULL
);

-- campaign_invites

CREATE TABLE vennt.campaign_invites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id uuid NOT NULL REFERENCES vennt.campaigns(id) ON DELETE CASCADE,
    "from" uuid NOT NULL REFERENCES vennt.accounts(id) ON DELETE CASCADE,
    "to" uuid NOT NULL REFERENCES vennt.accounts(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'SPECTATOR'::text,
    created timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX campaign_to_unique ON vennt.campaign_invites(campaign_id uuid_ops,"to" uuid_ops);

-- campaign_members

CREATE TABLE vennt.campaign_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id uuid NOT NULL REFERENCES vennt.campaigns(id),
    account_id uuid NOT NULL REFERENCES vennt.accounts(id),
    role text NOT NULL DEFAULT 'SPECTATOR'::text
);
CREATE UNIQUE INDEX campaign_account_unique ON vennt.campaign_members(campaign_id uuid_ops,account_id uuid_ops);

-- campaign_entities

CREATE TABLE vennt.campaign_entities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id uuid NOT NULL REFERENCES vennt.campaigns(id) ON DELETE CASCADE,
    entity_id uuid NOT NULL REFERENCES vennt.entities(id) ON DELETE CASCADE,
    gm_only boolean NOT NULL DEFAULT false
);

-- Unique constraint on campaign_entities
CREATE UNIQUE INDEX campaign_entity_unique ON vennt.campaign_entities(campaign_id uuid_ops,entity_id uuid_ops);

-- Add computed_attributes column to the entities table for cached result of rules engine
ALTER TABLE "vennt"."entities" ADD COLUMN "computed_attributes" jsonb;
