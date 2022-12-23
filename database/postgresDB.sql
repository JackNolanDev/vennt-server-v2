-- VENNT basic table definitions

--------- META TABLES ---------

-- accounts

CREATE TABLE vennt.accounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username text NOT NULL UNIQUE,
    email text NOT NULL UNIQUE,
    password text NOT NULL,
    role text NOT NULL DEFAULT 'USER'::text
);
CREATE UNIQUE INDEX accounts_pkey ON vennt.accounts(id uuid_ops);
CREATE UNIQUE INDEX accounts_username_key ON vennt.accounts(username text_ops);
CREATE UNIQUE INDEX accounts_email_key ON vennt.accounts(email text_ops);

--------- CHARACTER SHEETS ---------

-- entities

CREATE TABLE vennt.entities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    owner uuid NOT NULL REFERENCES vennt.accounts(id) ON DELETE CASCADE
    name text NOT NULL,
    type text DEFAULT 'CHARACTER'::text,
    attributes jsonb,
    other_fields jsonb
);
CREATE UNIQUE INDEX entities_pkey ON vennt.entities(id uuid_ops);

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
CREATE UNIQUE INDEX items_pkey ON vennt.items(id uuid_ops);

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
CREATE UNIQUE INDEX abilities_pkey ON vennt.abilities(id uuid_ops);

-- entity_changelog

CREATE TABLE vennt.attribute_changelog (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_id uuid NOT NULL REFERENCES vennt.entities(id) ON DELETE CASCADE,
    attr text NOT NULL,
    msg text,
    prev integer,
    time timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX attribute_changelog_pkey ON vennt.attribute_changelog(id uuid_ops);
CREATE INDEX entity_id_attr ON vennt.attribute_changelog(entity_id uuid_ops,attr text_ops);

--------- CAMPAIGNS ---------

-- campaigns

CREATE TABLE vennt.campaigns (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    owner uuid NOT NULL REFERENCES vennt.accounts(id),
    in_combat boolean NOT NULL DEFAULT false,
    init_index integer NOT NULL DEFAULT 0,
    init_round integer NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX campaigns_pkey ON vennt.campaigns(id uuid_ops);

-- campaign_invites

CREATE TABLE vennt.campaign_invites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id uuid NOT NULL REFERENCES vennt.campaigns(id) ON DELETE CASCADE,
    "from" uuid NOT NULL REFERENCES vennt.accounts(id) ON DELETE CASCADE,
    "to" uuid NOT NULL REFERENCES vennt.accounts(id) ON DELETE CASCADE,
    created timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX campaign_invites_pkey ON vennt.campaign_invites(id uuid_ops);

-- campaign_members

CREATE TABLE vennt.campaign_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id uuid NOT NULL REFERENCES vennt.campaigns(id),
    account_id uuid NOT NULL REFERENCES vennt.accounts(id),
    role text NOT NULL DEFAULT 'SPECTATOR'::text
);
CREATE UNIQUE INDEX campaign_members_pkey ON vennt.campaign_members(id uuid_ops);
CREATE UNIQUE INDEX campaign_account_unique ON vennt.campaign_members(campaign_id uuid_ops,account_id uuid_ops);

-- campaign_entities

CREATE TABLE vennt.campaign_entites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id uuid NOT NULL REFERENCES vennt.campaigns(id) ON DELETE CASCADE,
    entity_id uuid NOT NULL REFERENCES vennt.entities(id) ON DELETE CASCADE,
    gm_only boolean NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX campaign_entites_pkey ON vennt.campaign_entites(id uuid_ops);

-- json_storage

CREATE TABLE vennt.json_storage (
    key character varying(50) PRIMARY KEY,
    updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    json jsonb NOT NULL
);

CREATE UNIQUE INDEX json_storage_pkey ON vennt.json_storage(key text_ops);
