# Documentation

This is the documentation file of the code, which will introduce the function created and API used in the project.

`function maskS2clouds`

Function to mask clouds using the Sentinel-2 QA band.
* @input image Sentinel-2 image
* @return {ee.Image} cloud masked Sentinel-2 ima

`ee.ImageCollection().filterDate().filter(ee.Filter.lt()).map().mean()`

Filter the image without cloud using the function above.
* @input ImageCollection() {ee.image} image Sentinel-2 image
* @input filterDate() Two date in format like '2019-01-01'
* @input filter(ee.Filter.lt()) The property and the quantity of the filter
* @input map() the function want to map
* @input mean() the mean value of the image
* @return {ee.image} image Sentinel-2 image with selected date after cloud masking

`.expression()`

Compute NDWI using an expression to extract land region in the image.
* @input string the NDWI formula of the band
* @input bands from the dataset
* @return {ee.image} NDWI image 

`Studyarea.symmetricDifference()`

Compute the symmetric difference between two geometries.
* @input The geometry used as the left operan
* @input The maximum amount of error tolerated when performing any necessary reprojection.
* @return {ee.Geometry} Geometry with Studyarea minus input geometry

`Seagrass.merge(Deep_water)`

Merge the roi
* @input The roi wanted to merge with the seagrass
* @return {ee.FeatureCollection} ROI with features merged

`.select().sampleRegions()`

Sample the composite to generate training data.
* @input bands selected bands involved in the training set
* @input {collection: , properties, scale}
* @return {ee.FeatureCollection} Training data

`ee.Classifier.smileCart().train()`

CART classifier
* @input {feature:, classProperty:}
* @return {ee.Classifier} The CART classifier

`.classify()`

Classifies each feature in a collection.
* @input The classifier to use.
* @return {ee.FeatureCollection}

`ee.Classifier.smileRandomForest().train()`

Random forest classifier
* @input {feature:, classProperty:}
* @return {ee.Classifier} The RandomForest classifier

`ee.Classifier.minimumDistance().train()`

Minimum distance classifier
* @input {feature:, classProperty:}
* @return {ee.Classifier} The Minimum distance classifier

`withRandom.filter(ee.Filter.lt())`

Split the data of 75% for training, 25% for testing.
* @input The property for spliting
* @input The percentage of the training data
* @return {ee.Filter}

`.errorMatrix()`

Computes a 2D error matrix for a collection by comparing two columns of a collection: one containing the actual values, and one containing predicted values.
* @input collection
* @input string The name of the property containing the actual value
* @return {ee.Confusion Matrix}


`.reduceToVectors`

Convert an image to a feature collection by reducing homogenous regions. 
* @input {scale:} A nominal scale in meters of the projection to work in.
* @return {ee.FeatureCollection}

`vector.filterMetadata('label','equals',0)`

Filter the seagrass from the vector.
* @input The name of a property to filter.
* @input Operator
* @input value
* @return {ee.Collection}

`SeagrassWithArea.aggregate_sum('area')`

Aggregates over a given property of the objects in a collection, calculating the sum of the values of the selected property.
* @input The property to use from each element of the collection
* @return {ee.Number}
