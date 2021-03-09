// Step1: Cloud mask - to remove the cloud and cirrus in the remote sensing image
/**
 * Function to mask clouds using the Sentinel-2 QA band
 * @param {ee.Image} image Sentinel-2 image
 * @return {ee.Image} cloud masked Sentinel-2 image
 */
function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}

// Filter the image without cloud using the function above
var dataset = ee.ImageCollection('COPERNICUS/S2_SR')
                  .filterDate('2019-01-01', '2020-07-01')
                  // Pre-filter to get less cloudy granules.
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                  .map(maskS2clouds).mean();

var cliped_dataset = dataset.clip(Studyarea);

// Define the visualization pattern of the image
var visualization = {
  min: 0.0,
  max: 0.3,
  bands: ['B4', 'B3', 'B2'],
};

Map.setCenter(25.49, 39.96, 11);
Map.addLayer(cliped_dataset, visualization, 'Clipped Image');

// Step2: Land mask - to mask the land to avoid involving the land feature in classification
// Compute NDWI using an expression to extract land region in the image.
var ndwi = cliped_dataset.expression(
    '(green - nir ) / (green + nir )',
    {
        green: cliped_dataset.select('B3'),    // Green band
        nir: cliped_dataset.select('B8'),    // Near infrared band 
    });
    
Map.addLayer(ndwi);

// Clip the image without land using the mask
var masked_area = Studyarea.symmetricDifference(Landmask,10);
var masked_dataset = dataset.clip(masked_area);

Map.addLayer(masked_dataset);

// Step3: POI selection - for supervised classification
// Merge the three kinds of poi into a single FeatureCollection.
var roi = Seagrass.merge(Shallow_water).merge(Deep_water);

// Use these bands for classification.
var bands = ['B1', 'B2', 'B3', 'B4'];

// The name of the property on the points storing the class label.
var classProperty = 'landcover';

// Sample the composite to generate training data.
var training = masked_dataset.select(bands).sampleRegions({
  collection: roi,
  properties: [classProperty],
  scale: 30
});

// Step4: Supervised Classification - Using three kinds of classifier
// 1. CART classifier.
var classifier_Cart = ee.Classifier.smileCart().train({
  features: training,
  classProperty: classProperty,
});

// Print some info about the classifier (specific to CART).
print('CART, explained', classifier_Cart.explain());

// Classify the composite.
var classified_Cart = masked_dataset.classify(classifier_Cart);
Map.centerObject(roi);
Map.addLayer(classified_Cart, {min: 0, max: 2, palette: ['green', '#00ffff', 'blue']});

// 2. Random Forest classifier.
var classifier_Rf = ee.Classifier.smileRandomForest(5).train({
  features: training,
  classProperty: classProperty,
});

// Print some info about the classifier (specific to Random Forest).
print('Random Forest, explained', classifier_Rf.explain());

// Classify the composite.
var classified_Rf = masked_dataset.classify(classifier_Rf);
Map.centerObject(roi);
Map.addLayer(classified_Rf, {min: 0, max: 2, palette: ['green', '#00ffff', 'blue']});

// 3. Minimum Distance classifier.
var classifier_Mini = ee.Classifier.minimumDistance().train({
  features: training,
  classProperty: classProperty,
});

// Print some info about the classifier (specific to Minimum Distance).
print('Minimum Distance, explained', classifier_Mini.explain());

// Classify the composite.
var classified_Mini = masked_dataset.classify(classifier_Mini);
Map.centerObject(roi);
Map.addLayer(classified_Mini, {min: 0, max: 2, palette: ['green', '#00ffff', 'blue']});

// Step5: Accuracy assessment - to choose the best classifier
// Add a column of random uniforms to the training dataset.
var withRandom = training.randomColumn('random');

// We want to reserve some of the data for testing, to avoid overfitting the model.
var split = 0.75;  // Split the data of 75% for training, 25% for testing.
var trainingPartition = withRandom.filter(ee.Filter.lt('random', split));
var testingPartition = withRandom.filter(ee.Filter.gte('random', split));

// 1. Assessment of CART
var trainedClassifier_CART = ee.Classifier.smileCart().train({
  features: trainingPartition,
  classProperty: classProperty,
  inputProperties: bands
});

// Classify the test FeatureCollection.
var test_CART = testingPartition.classify(trainedClassifier_CART);

// Print the confusion matrix.
var confusionMatrix_CART = test_CART.errorMatrix(classProperty, 'classification');
print('Confusion Matrix of CART', confusionMatrix_CART);

// 2. Assessment of Random Forest
var trainedClassifier_Rf = ee.Classifier.smileRandomForest(5).train({
  features: trainingPartition,
  classProperty: classProperty,
  inputProperties: bands
});

// Classify the test FeatureCollection.
var test_Rf = testingPartition.classify(trainedClassifier_Rf);

// Print the confusion matrix.
var confusionMatrix_Rf = test_Rf.errorMatrix(classProperty, 'classification');
print('Confusion Matrix of Random Forest', confusionMatrix_Rf);

// 3. Assessment of Minimum Distance
var trainedClassifier_Mini = ee.Classifier.minimumDistance().train({
  features: trainingPartition,
  classProperty: classProperty,
  inputProperties: bands
});

// Classify the test FeatureCollection.
var test_Mini = testingPartition.classify(trainedClassifier_Mini);

// Print the confusion matrix.
var confusionMatrix_Mini = test_Mini.errorMatrix(classProperty, 'classification');
print('Confusion Matrix of Minimum Distance', confusionMatrix_Mini);

// Step6: Seagrass area calculation - to compare with the filed data
// Convert the raster to vector.
var vector = classified_Rf.reduceToVectors({
  scale:100,
});

// Filter the seagrass from the vector.
var seagrass_vector = vector.filterMetadata('label','equals',0);
Map.addLayer(seagrass_vector);
print(seagrass_vector);

// Compute the area and add as a property to the vector.
var SeagrassWithArea = seagrass_vector.map(function(f) {
  // Compute area in square meters.  Convert to hectares.
  var areaHa = f.area(10);

  // A new property called 'area' will be set on each feature.
  return f.set({area: areaHa});
});

print(SeagrassWithArea);

// Compute the summary of the seagrass area in the study area.
var area_of_seagrass = SeagrassWithArea.aggregate_sum('area');
print(area_of_seagrass);
