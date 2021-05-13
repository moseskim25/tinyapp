# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

The main URLs page displays all the urls associated with the registered user. Each url comes with it's own shortened URL which you can use to access the web page.
!["Screenshot of URLs page"](https://github.com/moseskim25/tinyapp/blob/master/docs/Main%20page%20with%20user%20logged%20in.png?raw=true)

You can register and create your own customized list here! 
!["Screenshot of registration page"](https://github.com/moseskim25/tinyapp/blob/f75ceac9821fa851197b36d1dc1de720159eb0d7/docs/Registration.png?raw=true)

Whenever you want to create a new URL just select 'Create New URL' in the top green bar and it will take you to the following page.
!["Screenshot of create new URL page"](https://github.com/moseskim25/tinyapp/blob/master/docs/Create%20new%20URL.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.