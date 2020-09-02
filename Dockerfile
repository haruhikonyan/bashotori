# TODO: alpine 化
FROM node:14.3.0-slim

# TODO: Typescrip 等がないとビルドできないから一旦 production 外す
# ENV NODE_ENV production
WORKDIR /bashotori

# see: https://github.com/puppeteer/puppeteer/blob/main/.ci/node12/Dockerfile.linux
# プラス日本語対応
RUN apt-get update && \
    apt-get -y install xvfb gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
      libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 \
      libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
      libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 \
      libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget \
      fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss-dev && \
    rm -rf /var/lib/apt/lists/*

COPY . /bashotori

RUN yarn

RUN yarn build

EXPOSE 3456
CMD ["yarn", "start"]
