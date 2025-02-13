FROM node:21
ENV NODE_ENV=production
WORKDIR /usr/src/app 
COPY ["package.json", "package-lock.json*","./"]
RUN npm install --production --silent
COPY . . 
RUN chown -R node /usr/src/app 
EXPOSE 9080 
EXPOSE 9443 
CMD ["npm", "start"]