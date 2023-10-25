CREATE EXTENSION IF NOT EXISTS pgcrypto;



-- Function to generate a random salt
CREATE OR REPLACE FUNCTION generate_salt() RETURNS VARCHAR(255) AS $$
DECLARE
    result VARCHAR(255);
BEGIN
    -- Generate a random salt using the md5 hash of a random UUID
    SELECT md5(gen_random_uuid()::text) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate a salted and hashed password and store it in the users table
CREATE OR REPLACE FUNCTION create_user(username VARCHAR, plaintext_password VARCHAR, access_level integer, rfid_hash VARCHAR ) RETURNS VOID AS $$
DECLARE
    salt VARCHAR(255);
    password_hash VARCHAR(255);
    access_status BOOLEAN;
BEGIN
    -- Generate a random salt
    salt := generate_salt();

    -- Use the crypt() function to hash the password with the salt
    password_hash := crypt(plaintext_password, salt);

    access_status = 'false';
    -- Insert the user record into the users table
    INSERT INTO users(username, password_hash, salt, rfid_hash, access_status, access_level)
    VALUES (username, password_hash, salt, rfid_hash,access_status, access_level );
END;
$$ LANGUAGE plpgsql;

-- Function to authenticate a user
CREATE OR REPLACE FUNCTION authenticate_user_zigbee_pw(
    username VARCHAR,
    provided_password VARCHAR,
    device_id INTEGER
) RETURNS json AS $$
DECLARE
    stored_password_hash VARCHAR(255);
    stored_salt VARCHAR(255);
    userid_stored integer;
    in_time timestamp;
    stored_access_status BOOLEAN;
BEGIN
    -- Retrieve the stored password hash and salt for the given username
    SELECT u.password_hash, u.salt INTO stored_password_hash, stored_salt
    FROM users u
    WHERE u.username = authenticate_user_zigbee_pw.username;

    -- Use the crypt() function to hash the provided password with the stored salt
    -- and compare it to the stored password hash
    IF crypt(provided_password, stored_salt) = stored_password_hash THEN
        -- Check current access status of user
        SELECT u.access_status INTO stored_access_status
        FROM users u
        WHERE u.username = authenticate_user_zigbee_pw.username;

        IF stored_access_status = 'false' THEN
            -- Retrieve user data for input into the usage table
            SELECT u.user_id INTO userid_stored
            FROM users u
            WHERE u.username = authenticate_user_zigbee_pw.username;

            in_time := NOW();
            stored_access_status := '1';

            -- Insert the user record into the usage table
            INSERT INTO usage(user_id, in_time, access_status, device_id)
            VALUES (userid_stored, in_time, stored_access_status, device_id);
            -- Update the access_status for a specific user
            UPDATE users
            SET access_status = '1'
            WHERE user_id = userid_stored;
            -- Return a success message
            RETURN '{"message": "Authentication successful"}'::json;       
        ELSE
            -- User has already logged in (Forbidden login)
            RETURN '{"message": "Forbidden login - User already logged in"}'::json;
        END IF;
    ELSE
        -- Password authentication failed
        RETURN '{"message": "Authentication failed"}'::json;
    END IF;


END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION authenticate_user_zigbee_rfid(rfid_hash VARCHAR, device_id INTEGER) RETURNS character varying AS $$
DECLARE
    stored_user_id integer;
    stored_access_status boolean;
    in_time timestamp;
BEGIN
    -- Check if the RFID hash exists in the users table
    SELECT u.user_id, u.access_status
    INTO stored_user_id, stored_access_status
    FROM users u
    WHERE u.rfid_hash = authenticate_user_zigbee_rfid.rfid_hash;

    -- If the RFID hash exists
    IF stored_user_id IS NOT NULL THEN
        -- If the access status is false, update it to true
        IF NOT stored_access_status THEN
            in_time := NOW();

            -- Insert the user record into the usage table
            INSERT INTO usage(user_id, in_time, access_status, device_id)
            VALUES (stored_user_id, in_time, TRUE, device_id);

            -- Update the access_status for a specific user
            UPDATE users
            SET access_status = TRUE
            WHERE user_id = stored_user_id;

            -- Return a success message
            RETURN '{"message": "Authentication successful"}'::json;
        ELSE
            -- User has already logged in (Forbidden login)
            RETURN '{"message": "Forbidden login - User already logged in"}'::json;
        END IF;
    ELSE
        -- RFID authentication failed - RFID not found
        RETURN '{"message": "Authentication failed - RFID not found"}'::json;
    END IF;
END;
$$ LANGUAGE plpgsql;







CREATE OR REPLACE FUNCTION authenticate_user_online(username text, provided_password text)
RETURNS INTEGER AS $$
DECLARE
    stored_password_hash VARCHAR(255);
    stored_salt VARCHAR(255);
    user_access_level INTEGER;
BEGIN
    -- Check if the user exists
    SELECT u.password_hash, u.salt, u.access_level INTO stored_password_hash, stored_salt, user_access_level
    FROM users u
    WHERE u.username = authenticate_user_online.username;

    -- If the user does not exist, return -1
    IF NOT FOUND THEN
        RETURN -1;
    END IF;

    -- If the provided password is correct
    IF crypt(provided_password, stored_salt) = stored_password_hash THEN
        -- Check the user's access level
        IF user_access_level = 0 THEN
            RETURN 0;
        ELSIF user_access_level = 1 THEN
            RETURN 1;
        ELSE
            -- Optionally, handle other access levels or return a specific value
            RETURN -2;
        END IF;
    ELSE
        -- If the password is incorrect, return -1
        RETURN -1;
    END IF;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION get_logs_with_device_type()
RETURNS TABLE(log_id INT, device_id INT, device_type VARCHAR, log_data JSON) AS $$
BEGIN
    RETURN QUERY 
    SELECT lt.log_id, lt.device_id, lt.device_type, lt.log_data
    FROM logtable lt;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION delete_log(p_log_id INTEGER)
RETURNS VOID AS $$
BEGIN
    DELETE FROM logtable WHERE log_id = p_log_id;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION get_usage()
RETURNS TABLE(usage_log_id INT, user_id INT,device_id INT, in_time VARCHAR) AS $$
BEGIN
    RETURN QUERY 
    SELECT lt.usage_log_id, lt.user_id, lt.device_id, lt.in_time
    FROM usage lt;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION delete_usage_log(p_usage_log_id INTEGER)
RETURNS VOID AS $$
BEGIN
    DELETE FROM usage WHERE usage_log_id = p_usage_log_id;
END;
$$ LANGUAGE plpgsql;




CREATE OR REPLACE FUNCTION get_devices()
RETURNS TABLE(device_id INT, mac_address VARCHAR, device_type VARCHAR) AS $$
BEGIN
    RETURN QUERY 
    SELECT lt.device_id, lt.mac_address, lt.device_type 
    FROM devices lt;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION delete_device(p_device_id INTEGER)
RETURNS VOID AS $$
BEGIN
    DELETE FROM devices WHERE device_id = p_device_id;
END;
$$ LANGUAGE plpgsql;
