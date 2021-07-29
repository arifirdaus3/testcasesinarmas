# Test Case Sinarmas

This API made using Node.js

## Install Dependencies
Before run this API please install dependencies first with
```
npm install
```

## Run the API
You need Node.js to run this API. To run this API type
```
npm start
```

## Available Routes
#### GET "/" 
Return drivers list. You can also provide driver_list as query to get specific driver.
**You need to provide Authentication Header to access this route ["admin"].**
#### PUT "/activate" 
Change Driver status from Off to Active.
**You need to provide Authentication Header to access this route ["driver"]. You also need to provide body data as JSON eg: {"driver_id": 1}**
#### PUT "/deactivate" 
Change Driver status from Active to Off.
**You need to provide Authentication Header to access this route ["driver"]. You also need to provide body data as JSON eg: {"driver_id": 1}**
#### PUT "/assign" 
Find nearest Driver and change Driver status to OnJob.
**You need to provide Authentication Header to access this route ["user"]. You also need to provide body data as JSON eg: {"lat": 3.15, "lon": 101.00}**
#### PUT "/deassign" 
Change Driver status from OnJob to Active.
**You need to provide Authentication Header to access this route ["driver", "admin"]. You also need to provide body data as JSON eg: {"driver_id": 1}**
