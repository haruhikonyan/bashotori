# TODO: alpine 化
FROM node:14.3.0-slim

# TODO: Typescrip 等がないとビルドできないから一旦 production 外す
# ENV NODE_ENV production
WORKDIR /bashotori

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss-dev \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY . /bashotori

RUN yarn

RUN yarn build

EXPOSE 3456
CMD ["yarn", "start"]
