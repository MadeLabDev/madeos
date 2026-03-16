#!/bin/bash

# Script to reset the database by dropping the existing database and importing from SQL file

# Database connection settings from .env.local
DB_HOST=localhost
DB_PORT=3306
DB_USER=madedb
DB_PASS=Thanhnguyen2015
DB_NAME=madedb

# Path to MySQL client (assuming MAMP installation)
MYSQL_CMD="/Applications/MAMP/Library/bin/mysql"

# Path to the SQL file
SQL_FILE="/Users/nguyenpham/Source Code/madeapp/tools/madelab_db_2026.sql"

# Check if MySQL client exists
if [ ! -f "$MYSQL_CMD" ]; then
    echo "Error: MySQL client not found at $MYSQL_CMD. Please ensure MAMP is installed or adjust the path."
    exit 1
fi

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo "Error: SQL file $SQL_FILE does not exist."
    exit 1
fi

# Drop and recreate the database
echo "Dropping and recreating database $DB_NAME..."
$MYSQL_CMD -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS -e "DROP DATABASE IF EXISTS $DB_NAME; CREATE DATABASE $DB_NAME;"

# Check if the command succeeded
if [ $? -ne 0 ]; then
    echo "Error: Failed to drop and create database."
    exit 1
fi

# Import the SQL file into the database
echo "Importing SQL file into $DB_NAME..."
$MYSQL_CMD -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS $DB_NAME < "$SQL_FILE"

# Check if import succeeded
if [ $? -eq 0 ]; then
    echo "Database reset and import completed successfully."
else
    echo "Error: Failed to import SQL file."
    exit 1
fi