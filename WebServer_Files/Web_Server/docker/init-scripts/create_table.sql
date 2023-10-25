CREATE TABLE users (
    "user_id" serial PRIMARY KEY,
    "username" varchar(255) NOT NULL UNIQUE,
    "password_hash" varchar(255) NOT NULL, 
    "rfid_hash" varchar,
    "access_status" BOOLEAN NOT NULL,
    "access_level" integer NOT NULL,
    "salt" varchar(255) NOT NULL
);

CREATE TABLE devices (
    "device_id" serial PRIMARY KEY,
    "mac_address" varchar NOT NULL,
    "device_type" varchar NOT NULL
);

CREATE TABLE logtable (
    "log_id" serial PRIMARY KEY,
    "device_id" integer NOT NULL,
    "log_data" json NOT NULL,
    "time_submitted" timestamp NOT NULL,
    "dataframe" integer NOT NULL,
    "device_type" VARCHAR NOT NULL
);

CREATE TABLE usage (
    "usage_log_id" serial PRIMARY KEY,
    "user_id" integer NOT NULL REFERENCES users("user_id") ON DELETE CASCADE,
    "in_time" VARCHAR,
    "out_time" VARCHAR,
    "access_status" BOOLEAN NOT NULL,
    "device_id" integer NOT NULL 
)