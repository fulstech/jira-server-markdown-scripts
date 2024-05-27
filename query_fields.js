const axios = require("axios");
require("dotenv").config();

// Replace with your Jira instance URL and API token
const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const CUSTOM_FIELD_KEY =
  "com.fulstech.jira-gherkin-custom-field:com.fulstech.atlassian.jira.gherkin.field";

// Function to get all fields and corresponding projects for the custom field key
async function getFieldsAndProjects() {
  try {
    const projectsResponse = await axios({
      method: "GET",
      url: `${JIRA_BASE_URL}/rest/api/2/project`,
      headers: {
        Authorization: `Bearer ${JIRA_API_TOKEN}`,
        Accept: "application/json",
      },
    });

    const projects = projectsResponse.data;
    const projectDetails = [];

    for (const project of projects) {
      const issueTypesResponse = await axios({
        method: "GET",
        url: `${JIRA_BASE_URL}/rest/api/2/issue/createmeta/${project.id}/issuetypes`,
        headers: {
          Authorization: `Bearer ${JIRA_API_TOKEN}`,
          Accept: "application/json",
        },
      });

      const issueTypes = issueTypesResponse.data.values;

      for (const issueType of issueTypes) {
        const fieldsResponse = await axios({
          method: "GET",
          url: `${JIRA_BASE_URL}/rest/api/2/issue/createmeta/${project.id}/issuetypes/${issueType.id}`,
          headers: {
            Authorization: `Bearer ${JIRA_API_TOKEN}`,
            Accept: "application/json",
          },
        });

        const fields = fieldsResponse.data.values;
        console.log(fields);
        const field = fields.find(
          (field) => field.schema.custom === CUSTOM_FIELD_KEY
        );

        if (field) {
          projectDetails.push({
            projectName: project.name,
            projectKey: project.key,
            issueType: issueType.name,
            customField: field,
          });
        }
      }
    }

    console.log("Projects with custom field:");
    projectDetails.forEach((detail) => {
      console.log(
        `Project: ${detail.projectName} (${detail.projectKey}), Issue Type: ${detail.issueType}, Field: ${detail.customField.name}`
      );
    });
  } catch (error) {
    console.error(`Error fetching fields and projects: ${error}`);
  }
}

// Run the function with the custom field key
getFieldsAndProjects();
