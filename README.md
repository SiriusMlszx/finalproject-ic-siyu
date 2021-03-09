# Overview

Seagrass plays an important role in maintaining marine biodiversity, marine ecology and even the global environment. 

The objective of the project is to develop a workflow based on the Google Earth Engine (GEE) platform that can map and monitor seagrass habitats using optical satellite remote sensing data. 

To achieve this, the region around Lemnos Island in the north part of the north Aegean Sea is selected because the field data for validation can be accessed from website and there are plenty of Posidonia seagrass growing on the east coast of the Lemnos. 

# Files introduction

In `Code` folder, there are three scripts files `seagrass_mapping.js`, `import_features.js` and `test_on_Western Greece` with a documentation file `documentation.md` in the Folder `Documentation`. `seagrass_mapping.js` is the main solution of the project. You can copy the feature and one solution code to the Code Editor of the GEE and run it.

In `FinalReport` folder, there are `Final Report Siyu.pdf` and `Final Report Template.docx`. Whole process and the details are written in the `Final Report Siyu.pdf`.

In `ProjectPlan` folder, there are `SiyuWang_ACSE9_ProjectPlan.pdf` and `Project Plan Template.docx`.

In `Image` folder, there are images used in the readme file.

# User Guide

### 1. Preparation

The entire development process can be implemented in the Code Editor from the GEE platform in Javascript, as shown in the figure below.

<img src="https://github.com/SiriusMlszx/finalproject-ic-siyu/edit/master/images/code_editor.png">

### 2. Import data

User can draw their interested study area using the drawing tools and create the training data set.

<img src="https://github.com/SiriusMlszx/finalproject-ic-siyu/edit/master/images/studyarea.png">

### 2. Cloud Mask

Because the cloud in the image may affect our interpretation of the images, the cloud mask is needed. The code below is filter condition of the project. User can edit the date, import data, cloud percentage, etc.


```js
var dataset = ee.ImageCollection('COPERNICUS/S2_SR')
                  .filterDate('2019-01-01', '2020-07-01')
                  // Pre-filter to get less cloudy granules.
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                  .map(maskS2clouds).mean();
```

### 3. Classification

Any classification method can be perfromed by GEE like the code block below.

```js
var classifier_Cart = ee.Classifier.smileCart().train({
  features: training,
  classProperty: classProperty,
});

// Classify the composite.
var classified_Cart = masked_dataset.classify(classifier_Cart);
```

### 4. Accuracy assessment

The accuracy assessment for the classifier need to derive the confusion matrix. 

```js
// Print the confusion matrix.
var confusionMatrix_Mini = test_Mini.errorMatrix(classProperty, 'classification');
print('Confusion Matrix of Minimum Distance', confusionMatrix_Mini);
```

### 5. Seagrass area calculation

This step includes converting the raster to vector and compute the area of each vector unit and sum them.

```js
// Compute the summary of the seagrass area in the study area.
var area_of_seagrass = SeagrassWithArea.aggregate_sum('area');
print(area_of_seagrass);
```

### 6. Access to the app

The app's link is: https://siriusflora.users.earthengine.app/view/seagrass-mapping-on-lemnos. You need to input 'Lemnos' in the search bar on the top and wait for processing.
