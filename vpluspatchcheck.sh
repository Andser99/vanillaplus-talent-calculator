#!/bin/bash

# Define variables
SFTP_SERVER="sftp@cdn.vanillaplus.org"
FILE_PATH="/upload/Data/patch-3.MPQ"
DATE_FILE="last_modified_date.txt"
REPOSITORY_PATH="your/repo/path/here"
export SSHPASS=sftp

# Define the patch function
patch() {
    echo "Running patch process..."
    # Add your patching logic here. For example, if you want to download the file:
    cd $REPOSITORY_PATH
    npx tsx ./src/trees/DBC/extractor.ts
    npx tsx ./src/trees/generator/generateTrees.ts
    npm run deploy
    echo "Patch process completed."
}

# Infinite loop to check every 60 seconds
while true; do
    # Use sftp to check the modified date of the file
    MODIFIED_DATE=$(sshpass -e sftp -oBatchMode=no -b - "$SFTP_SERVER" <<EOF | grep -E '^-' | awk '{print $6, $7, $8}'
ls -l $FILE_PATH
EOF
    )

    # Check if MODIFIED_DATE was successfully retrieved
    if [[ -n "$MODIFIED_DATE" ]]; then
        # Convert the date to a sortable format (YYYY-MM-DD HH:MM:SS)
        SORTABLE_DATE=$(date -d "$MODIFIED_DATE" +"%Y-%m-%d %H:%M:%S")
        echo "File modified on: $SORTABLE_DATE"

        # Check if the saved date file exists
        if [[ -f "$DATE_FILE" ]]; then
            # Read the saved last modified date
            SAVED_DATE=$(cat "$DATE_FILE")
            
            # Compare the saved date with the current modified date
            if [[ "$SAVED_DATE" != "$SORTABLE_DATE" ]]; then
                echo "Hello"
                # Run the patch function if the date has changed
                patch
                # Save the new modified date
                echo "$SORTABLE_DATE" > "$DATE_FILE"
            else
                echo "Unchanged"
            fi
        else
            # If no saved date exists, save the current modified date
            echo "$SORTABLE_DATE" > "$DATE_FILE"
            echo "Unchanged"
        fi
    else
        echo "Error: Could not retrieve file modified date."
    fi
    
    # Wait for 60 seconds before checking again
    sleep 60
done
