FROM nodesource/jessie:6.3.1

ADD package.json package.json  
RUN npm install  
ADD . .

EXPOSE 3000

CMD ["node","bot.js"] 
