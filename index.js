const fs = require("fs");
const yaml = require("js-yaml");
const core = require("@actions/core");

const path = core.getInput("path_to_files");
const validUsers = core
  .getInput("api_users")
  .split(",")
  .filter((u) => !!u);

const files = fs
  .readdirSync(path)
  .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

files
  .map((file) => {
    try {
      const content = yaml.load(fs.readFileSync(`${path}/${file}`, "utf8"));
      return [file, content];
    } catch (error) {
      fail(`Error parsing file ${file} : ${error}`);
    }
  })
  .forEach(([file, content]) => {
    switch (content.type) {
      case "topic":
        parseTopic(file, content);
        break;
      case "post":
        parsePost(file, content);
        break;
      default:
        fail(
          `File ${file} must be of type "topic" or "post", found ${content.type}`
        );
    }
  });

function parseTopic(fileName, content) {
  const { title, body, api, trigger } = content;
  if (!title || !body) {
    fail(`File ${fileName} with type topic must have a title and body`);
  }

  parseAPIUser(fileName, api);
  parseTrigger(fileName, trigger);
}

function parsePost(fileName, content) {
  const { topic, body, trigger, api } = content;
  if (!topic || !body) {
    fail(`File ${fileName} with type post must have a topic and body`);
  }

  if (!files.includes(topic + ".yaml")) {
    fail(
      `File ${fileName} has an invalid topic, ${topic}.yaml does not exist `
    );
  }

  parseAPIUser(fileName, api);
  parseTrigger(fileName, trigger);
}

function parseAPIUser(fileName, api) {
  if (!api || !api.user) {
    fail(`File ${fileName} is missing the "api.user" entry`);
  }

  if (validUsers.length > 0 && !validUsers.includes(api.user)) {
    fail(
      `File ${fileName} has an invalid API user ${api.user}, must be one of ${validUsers}`
    );
  }
}

function parseTrigger(fileName, trigger) {
  if (!trigger) {
    return;
  }

  switch (trigger.type) {
    case "flag":
      if (!trigger.tag)
        fail(
          `File ${fileName} is using a flag trigger, but is missing "tag" field`
        );
      break;
    case "timer":
      if (!trigger.after)
        fail(
          `File ${fileName} is using a timer trigger, but is missing "after" field`
        );
      break;
    case "score":
      if (!trigger.value)
        fail(
          `File ${fileName} is using a score trigger, but is missing "value" field`
        );
      break;
    default:
      fail(
        `File ${fileName} has an invalid trigger type ${trigger.type}, must be one of flag, timer, score`
      );
  }
}

function fail(message) {
  core.setFailed(message);
  process.exit(1);
}
