# Bun JS boilerplate

This is a boilerplate for [Bun](https://bun.sh/) projects. This template is a Typescript-based project to provide a solid foundation for building robust and scalable applications. If you are looking for a REST API boilerplate, check out the [rest-api](https://github.com/RedactDigital/boilerplate-bun/tree/rest-api) branch of this repository. It adds a few extra features to get you started with building a REST API to include authentication, database integration, and more.

## Environment Variables

Utilize the `app/environment.ts` file if you want to add type definitions for your environment variables. Ensure that the variables match your `.env` file. It is also noted that if you set default values for your environment variables in your code, you should define them as `type | undefined` so that you know if the variable is set by default in a development setting.
