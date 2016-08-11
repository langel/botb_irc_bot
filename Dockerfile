FROM nodesource/jessie:6.3.1

RUN apt-get update && apt-get install -y lame sox curl

ADD package.json package.json  
RUN npm install  
RUN npm install supervisor -g
ADD bot.js .

EXPOSE 3000

CMD ["supervisor","bot.js"]
