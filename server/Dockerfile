FROM keymetrics/pm2:18-alpine

WORKDIR /src

# Bundle APP files
COPY . /src

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --omit-dev

# Show current folder structure in logs
RUN ls -al -R

#RUN pm2 install pm2-server-monit

EXPOSE 3000

CMD [ "pm2-runtime", "start", "pm2.json" ]
