FROM node:lts-alpine

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

RUN npm install --production --silent && mv node_modules ../

COPY . .

# Create the temp directory and ensure the node user has ownership
RUN mkdir -p /usr/src/app/temp \
    && chown -R node:node /usr/src/app/temp \
    && chown -R node /usr/src/app \
    && chown -R node /usr

EXPOSE 3400

USER node

CMD ["npm", "start"]