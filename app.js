const axios = require("axios");
const fs = require('fs');

const AUTH_TOKEN = 'Basic bGl2ZV8wNWJkMGRjZjUzZmQ0ZDYyYWE4MTQwNWEwOGMxMTdkOTo=';
const API_KEY = "test_4e8dee75fcdb4c0f95d6b40ee3ccd3e1";

axios.defaults.baseURL = "https://api.scale.com/v1";
axios.defaults.headers.common["Authorization"] = AUTH_TOKEN;
axios.defaults.headers.common["Accept"] = "application/json";

const project = "Traffic Sign Detection";
const tasksEnpoint = `/tasks?project=${project}&status=completed&limit=100&include_attachment_url=true`;

const getTasks = async () => {
  try {
    const response = await axios.get(tasksEnpoint);
    return response.data.docs;
  } catch (error) {
    console.error(error);
  }
};


const verifyLabel = (label, validLabels) => {
  const validLabel = validLabels.includes(label);
  return {
    attribute: 'label',
    value: label,
    valid: validLabel,
    message: validLabel ? '' : 'Invalid label'
  }
};
const verifyOclussion = (occlusion, validOcclusions) => {
  const validOcclusion = validOcclusions.includes(occlusion);
  const numbOclussion = Number(occlusion.replace('%', ''));
  const verification = {
    attribute: 'occlusion',
    value: occlusion,
    valid: validOcclusion,
    message: validOcclusion ? '' : 'Invalid occlusion'
  }
  if (numbOclussion >= 75) verification.warning = 'High occlusion';
  return verification;
};
const verifyTruncation = (truncation, validTruncations) => {
  const validTruncation = validTruncations.includes(truncation);
  const numbTruncation = Number(truncation.replace('%', ''));
  const verification = {
    attribute: 'truncation',
    value: truncation,
    valid: validTruncation,
    message: validTruncation ? '' : 'Invalid truncation'
  }
  if (numbTruncation >= 75) verification.warning = 'High truncation';
  return verification;
};
const verifyBgColor = (bgColor, validBgColors) => {
  const validBgColor = validBgColors.includes(bgColor);
  return {
    attribute: 'background_color',
    value: bgColor,
    valid: validBgColor,
    message: validBgColor ? '' : 'Invalid background_color'
  };
};

const checkTaskAnnotations = (taskAnnotations, params) => {
  const taskAnnotationsChecks = [];
  taskAnnotations.forEach(annotation => {
    const checks = {
      uuid: annotation.uuid,
      label: annotation.label,
      annotations: []
    };
    switch (annotation.label) {
      case 'traffic_control_sign':
        // implement this only for traffic lights
        const validTrafficSignColor = annotation.attributes.background_color === params.annotation_attributes.background_color.choices[6];
        checks.annotations.push({
          attribute: 'background_color',
          value: annotation.attributes.background_color,
          valid: validTrafficSignColor,
          message: validTrafficSignColor ? '' : 'Invalid background_color'
        });
        break;
      case 'non_visible_face':
        const validNonFaceColor = annotation.attributes.background_color === params.annotation_attributes.background_color.choices[7];
        checks.annotations.push({
          attribute: 'background_color',
          value: annotation.attributes.background_color,
          valid: validNonFaceColor,
          message: validNonFaceColor ? '' : 'Invalid background_color'
        });
        break;
      default:
        checks.annotations.push(verifyBgColor(annotation.attributes.background_color, params.annotation_attributes.background_color.choices));
        break;
    }
    checks.annotations.push(verifyLabel(annotation.label, params.objects_to_annotate));
    checks.annotations.push(verifyOclussion(annotation.attributes.occlusion, params.annotation_attributes.occlusion.choices));
    checks.annotations.push(verifyTruncation(annotation.attributes.truncation, params.annotation_attributes.truncation.choices));
    taskAnnotationsChecks.push(checks);
  });
  return taskAnnotationsChecks;
};

const verifyTasks = (tasks) => {
  const tasksValidations = [];
  tasks.forEach((task) => {
    const check = {}
    check.task_id = task.task_id;
    check.created_at = task.created_at;
    check.completed_at = task.completed_at;
    check.status = task.status;
    check.qaCheck = checkTaskAnnotations(task.response.annotations, task.params);
    tasksValidations.push(check);
  });
  return tasksValidations;
}; 

const start = async () => {
  const tasks = await getTasks();
  const projectQAChecks = {
    project,
    tasksValidations: verifyTasks(tasks)
  };
  
  fs.writeFile(`${project}-QA checks.txt`, JSON.stringify(projectQAChecks), function(err) {
    if (err) {
        console.log(err);
    }
  });
};

start();

