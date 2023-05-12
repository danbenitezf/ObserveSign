# Observe Sign
The purpose of this project is to ingest a tasks responses from the scale api and perform a quality checks on the data. The quality checks are based on the data schema and the data itself. The data then is saved as a txt file in the local machine.

## Setup
Clone the repo and install the dependencies.

```bash
git clone https://github.com/danbenitezf/ObserveSign.git
cd ObserveSign
```

```bash
npm install
```

# Reflections
With more time on this exercise I would have liked to have implemented the following:
- Unit testing
- More error handling
- More data validation
- More data quality checks

Regarding the quality checks, I would have liked to have implemented the following:
- Check if the annotation size is the same as the image size (width and height) and in the event it is return an error as the annotation is not valid.
- Check if the annotation is inside the image and in the event it is not return an error as the annotation is not valid.
- Check if the annotation is a valid polygon (geometry) and in the event it is not return an error as the annotation is not valid.
- Set a minimun and maximun threshold for the occlusion and truncation values as in those cases the annotation may not be valid or may not be useful for the model.
- Find a way to differentiate traffic lights from traffic signs as the annotation type is the same for both. 
- Validate the background color for the traffic lights is set as "other"
- Analyze width and height from annotations to determine if the annotation is individual or should be splitted into multiple annotations.
- Refactor the code to make it more modular and reusable.
- check if the output is in the correct format to be used.

