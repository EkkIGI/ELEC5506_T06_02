## @brief Define the directory path of log files to be analysed
$directoryPath = "C:\Users\Jevon\Desktop\Design Data Analysis\Sample Logs"

## @brief Flag to control the loop
$exitLoop = $false

## @brief Initialise an array to keep track of processed file names
$processedFiles = @()

##
## @brief The following part of the script analyses a log file and determines the desired output parameters to share wirelessly
##
while (-not $exitLoop) {
    ## @brief Get a list of all log files in the directory
    $files = Get-ChildItem -Path $directoryPath

    ## @brief Loop through each file individually and read their content
    foreach ($file in $files) {
        ## @brief Check if the item is a file (not a directory)
        if (-not $file.PSIsContainer -and -not ($processedFiles -contains $file.Name)) {
            $filePath = $file.FullName

            ## @brief Add the processed file name to the list
            $processedFiles += $file.Name

            ## @brief Read the contents of the log file
            $data = Get-Content -Path $filePath

            ##
            ## @brief Log file's column order and number of columns can be determined from row 7: "Internal Types" heading.
            ## The following determines the column numbers (references) of Penning Pressure ("PenningIst"), MSK Pressure ("MSKIst"), and ICP Power ("QPwrIst").
            ##
            ## @details Check if row 7 exists and contains "Internal Types: "
            if ($data.Count -gt 6 -and $data[6] -match "Internal Types:") {
                ## @brief Split the row by the "Internal Types: " text
                $contentAfterText = $data[6] -split "Internal Types: ", 2 | Select-Object -Last 1

                ## @brief Convert the content after "Internal Types:" to an array
                $column_headings = $contentAfterText -split '\s+'

                ## @brief Initialise variables to store indexes of desired parameters
                $penningIstIndex = -1
                $mskIstIndex = -1
                $qPwrIstIndex = -1

                ##
                ## @brief Loop through the column headings to find the indexes of desired parameters
                ##
                for ($i = 0; $i -lt $column_headings.Length; $i++) {
                    if ($column_headings[$i] -eq "PenningIst") {
                        $penningIstIndex = $i + 1
                    } elseif ($column_headings[$i] -eq "MSKIst") {
                        $mskIstIndex = $i + 1
                    } elseif ($column_headings[$i] -eq "QPwrIst") {
                        $qPwrIstIndex = $i + 1
                    }
                }}
            
            ## @brief Check if the filename contains "StandardCleaning" to then mark as "cleaning"
            $containsStandardCleaning = $filePath -like "*StandardCleaning*"

            ## @brief Initialise variables for data array
            $penningpr_time0 = $null
            $msk_time0 = $null
            $penningpr_timemax = $null
            $msk_timemax = $null
            $rowNumber = 0

            ## @brief Initialise an array to store time for which ICP Power > 0
            $time_values = @()

            ## @brief Initialise variables to calculate average ICP Power when ICP Power > 0
            $sumOf_ICPpower = 0
            $countOf_ICPpower_entries = 0

            ##
            ## @brief Read the log file and process each line
            ##
            Get-Content $filePath | ForEach-Object {
			## @brief Split the line into columns (assuming columns are separated by spaces or tabs)
			$columns = $_.Trim() -split '\s+'

			## @brief Increment the row number
			$rowNumber++

			##
			## @brief Convert all values from row 12 onwards to double (i.e., all data entries after headings)
			##
			if ($rowNumber -ge 12) {
				$columns = $columns | ForEach-Object { [double]$_ }
			}

			## @brief Check if Penning Pressure and MSK columns exist
			if ($columns.Length -gt $penningIstIndex) {
				$penningpr_column = $columns[$penningIstIndex]
			}
			if ($columns.Length -gt $mskIstIndex) {
				$msk_column = $columns[$mskIstIndex]
			}

			##
			## @brief Check when ICP Power is > 0
			##
			if ($rowNumber -ge 12 -and $columns[$qPwrIstIndex] -gt 0) {
				## @brief Add time of data entry to the time_values array (assume "time" column is always the first column)
				$time_values += $columns[0]
			## @brief Add ICP Power entry to the array to then later calculate the average.
			$sumOf_ICPpower += $columns[$qPwrIstIndex]
			$countOf_ICPpower_entries++

			## @brief Store the Penning Pressure and MSK values at time t=0.
			if ($rowNumber -eq 12) {
				$penningpr_time0 = $penningpr_column
				$msk_time0 = $msk_column
			}

			## @brief Store the Penning Pressure and MSK values at time t=max.
			$penningpr_timemax = $penningpr_column
			$msk_timemax = $msk_column

			## @brief Calculate the Process Time as the difference between the maximum and minimum values in time_values array.
			if ($time_values.Count -gt 0) {
				$process_time = [double]($time_values | Measure-Object -Maximum).Maximum - [double]($time_values | Measure-Object -Minimum).Minimum
			} else {
				$process_time = $null
			}

			## @brief Calculate the average ICP Power when ICP Power > 0.
			if ($countOf_ICPpower_entries -gt 0) {
				$ICPpower_avg = [double]($sumOf_ICPpower / $countOf_ICPpower_entries)
			} else {
				$ICPpower_avg = $null
			}

			## @brief Convert the seven output parameters to the desired data type.
			$valuesArray = @(
				[float]$penningpr_time0,
				[float]$msk_time0,
				[float]$penningpr_timemax,
				[float]$msk_timemax,
				[int]$process_time,  ## Fifth value: Minimum value in column 1 when column 3 is greater than 0.
				[float]$ICPpower_avg,  ## Sixth value: Average of column 3 when > 0.
				[byte]$containsStandardCleaning  ## Seventh value: Boolean indicating if the filename contains "StandardCleaning".
			)

			## @brief Create a data array with the seven desired parameters analysed from the log file.
			$output_array = $valuesArray

			## @brief Print the values as a single array (remove this line if you don't want to print values).
			# Write-Host $output_array

	## @brief Initialise the Zigbee frame to be transmitted.
	## @brief Initialise starting frame ID.
	$frameID = 0x00 

	## @brief Initialise a Zigbee transmission frame.
	## Consisting of sections: <start delimiter><length><frame type><frame ID><64-bit dest. address><16-bit dest. address><broadcast radius><options><data array><checksum>
	$startDelimiterSend = [byte[]]@(0x7E) | ForEach-Object  {$_.ToString("X2")}
	$lengthSend = [byte[]]@(0x00, 0x27) | ForEach-Object  {$_.ToString("X2")}
	$frameTypeSend = [byte[]]@(0x10) | ForEach-Object  {$_.ToString("X2")}
	$frameID ++
	if ($frameIDSend -gt 0xFF) {$frameIDSend = 0x01}
	$frameIDSend = [byte[]]@($frameID) | ForEach-Object  {$_.ToString("X2")}
	$destAddress64BitSend = [byte[]]@(0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00) | ForEach-Object  {$_.ToString("X2")}
	$destAddress16BitSend = [byte[]]@(0xFF, 0xFE) | ForEach-Object  {$_.ToString("X2")}
	$broadcastRadiusSend = [byte[]]@(0x00) | ForEach-Object  {$_.ToString("X2")}
	$optionsSend = [byte[]]@(0x00) | ForEach-Object  {$_.ToString("X2")}

	$hex_array = @()

	## @brief Convert Penning Pr at t=0 from data array from decimal float to hexadecimal bytes, and add to hex_array.
	# Convert float to bits
	$bytearray0 = [BitConverter]::GetBytes([float]$output_array[0]) 
	# Reverse order of bits by looping through array (to then convert to hex) 
	$reversed0 = [byte[]]@()
	for ($i = $bytearray0.Length - 1; $i -ge 0; $i--) {
		$reversed0 += $bytearray0[$i] }
	# Convert reversed bits array to hexadecimal bytes (correct order)
	$hex_value0 = $reversed0 | ForEach-Object  {$_.ToString("X2")}
	$hex_array += $hex_value0
	
	## @brief Add ICP Power entry to the array to then later calculate the average.
	$sumOf_ICPpower += $columns[$qPwrIstIndex]
	$countOf_ICPpower_entries++

	## @brief Store the Penning Pressure and MSK values at time t=0.
	if ($rowNumber -eq 12) {
		$penningpr_time0 = $penningpr_column
		$msk_time0 = $msk_column
	}

	## @brief Store the Penning Pressure and MSK values at time t=max.
	$penningpr_timemax = $penningpr_column
	$msk_timemax = $msk_column

	## @brief Calculate the Process Time as the difference between the maximum and minimum values in time_values array.
	if ($time_values.Count -gt 0) {
		$process_time = [double]($time_values | Measure-Object -Maximum).Maximum - [double]($time_values | Measure-Object -Minimum).Minimum
	} else {
		$process_time = $null
	}

	## @brief Calculate the average ICP Power when ICP Power > 0.
	if ($countOf_ICPpower_entries -gt 0) {
		$ICPpower_avg = [double]($sumOf_ICPpower / $countOf_ICPpower_entries)
	} else {
		$ICPpower_avg = $null
	}

	## @brief Convert the seven output parameters to the desired data type.
	$valuesArray = @(
		[float]$penningpr_time0,
		[float]$msk_time0,
		[float]$penningpr_timemax,
		[float]$msk_timemax,
		[int]$process_time,  ## Fifth value: Minimum value in column 1 when column 3 is greater than 0.
		[float]$ICPpower_avg,  ## Sixth value: Average of column 3 when > 0.
		[byte]$containsStandardCleaning  ## Seventh value: Boolean indicating if the filename contains "StandardCleaning".
	)

	## @brief Create a data array with the seven desired parameters analysed from the log file.
	$output_array = $valuesArray

	## @brief Print the values as a single array (remove this line if you don't want to print values).
	# Write-Host $output_array

	## @brief Initialise the Zigbee frame to be transmitted.
	## @brief Initialise starting frame ID.
	$frameID = 0x00 

	## @brief Initialise a Zigbee transmission frame.
	## Consisting of sections: <start delimiter><length><frame type><frame ID><64-bit dest. address><16-bit dest. address><broadcast radius><options><data array><checksum>
	$startDelimiterSend = [byte[]]@(0x7E) | ForEach-Object  {$_.ToString("X2")}
	$lengthSend = [byte[]]@(0x00, 0x27) | ForEach-Object  {$_.ToString("X2")}
	$frameTypeSend = [byte[]]@(0x10) | ForEach-Object  {$_.ToString("X2")}
	$frameID ++
	if ($frameIDSend -gt 0xFF) {$frameIDSend = 0x01}
	$frameIDSend = [byte[]]@($frameID) | ForEach-Object  {$_.ToString("X2")}
	$destAddress64BitSend = [byte[]]@(0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00) | ForEach-Object  {$_.ToString("X2")}
	$destAddress16BitSend = [byte[]]@(0xFF, 0xFE) | ForEach-Object  {$_.ToString("X2")}
	$broadcastRadiusSend = [byte[]]@(0x00) | ForEach-Object  {$_.ToString("X2")}
	$optionsSend = [byte[]]@(0x00) | ForEach-Object  {$_.ToString("X2")}

	$hex_array = @()

	## @brief Convert Penning Pr at t=0 from data array from decimal float to hexadecimal bytes, and add to hex_array.
	# Convert float to bits
	$bytearray0 = [BitConverter]::GetBytes([float]$output_array[0]) 
	# Reverse order of bits by looping through array (to then convert to hex) 
	$reversed0 = [byte[]]@()
	for ($i = $bytearray0.Length - 1; $i -ge 0; $i--) {
		$reversed0 += $bytearray0[$i] }
	# Convert reversed bits array to hexadecimal bytes (correct order)
	$hex_value0 = $reversed0 | ForEach-Object  {$_.ToString("X2")}
	$hex_array += $hex_value0

	## @brief Add sections to Zigbee transmission frame.
	$zigbeeframe1 = @(
		$startDelimiterSend,
		$lengthSend,
		$frameTypeSend,
		$frameIDSend,
		$destAddress64BitSend,
		$destAddress16BitSend,
		$broadcastRadiusSend,
		$optionsSend,
		$hex_array) -replace ' ','' -join ''

	## @brief Modify the structure of the frame so that each element is a single byte.
	$zigbeeframe2 = @()
	for ($i=0; $i -lt $zigbeeframe1.Length; $i +=2){
		$pair = $zigbeeframe1[$i..($i+1)] -join ''
		$zigbeeframe2 += $pair}

	## @brief Calculate the checksum for the Zigbee frame.
	$summedPairs = 0
	## Loop through zigbeeframe2 in pairs and sum.
	for ($i=3; $i -lt $zigbeeframe2.Length; $i +=1){
		$summedPairs += [convert]::ToInt32($zigbeeframe2[$i],16)}
	$sumHex = [convert]::ToString($summedPairs,16).ToUpper() 
	$lowestbyte = [convert]::ToInt32((@($sumHex[$sumHex.Length - 2],$sumHex[$sumHex.Length - 1]) -join ''),16)
	$checksumSend = [convert]::ToString((255 - $lowestbyte),16).ToUpper() 

	## @brief Append the calculated checksum to the Zigbee frame.
	$zigbeeframe2 += $checksumSend

	## @brief Convert the transmission frame string to byte array.
	$bytesToSend = -split $zigbeeframe2 | ForEach-Object { [byte]::Parse($_, 'HexNumber') }

	## @brief Display the Zigbee transmission frame.
	Write-Host $zigbeeframe2

	## @brief Transmit the Zigbee frame through a COM port connected to an XBee module.
	$comPort = "COM3"  # Update this to your actual COM port.
	$serialPort = New-Object System.IO.Ports.SerialPort
	$serialPort.PortName = $comPort
	$serialPort.BaudRate = 9600
	try {
		$serialPort.Open()
		$serialPort.Write($bytesToSend, 0, $bytesToSend.Length)
	}
	catch { Write-Host "Error: $_" }
	finally {
		if ($serialPort -ne $null -and $serialPort.IsOpen) {
			$serialPort.Close()
			$serialPort.Dispose()
		}
	}

	## @brief Continuously monitor and check for a manual exit condition.
	## Press Ctrl+C to halt the script.
	if ($Host.UI.RawUI.KeyAvailable) {
		$key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
		if ($key.ControlKeyState -eq 2 -and $key.VirtualKeyCode -eq 67) {
			Write-Host "Exiting the script..."
			$exitLoop = $true
		}
	}
}
