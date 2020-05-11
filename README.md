# Minimal Discogs
A streamlined website for searching with the Discogs.com API.

## Note: Discogs.com OAuth
In order to use this, you'll need to enter your Discogs.com user KEY and SECRET in the discogs.js file. (Just do a search for GITHUB). Info about Discogs.com user auth is up here: https://blog.discogs.com/en/api-update-discogs-auth/

## About
I initially started working with the [Discogs API](https://www.discogs.com/developers) because I was looking up album covers from specific genres & time periods to use as references for graphic design. However, I often found myself googling interesting-looking albums to see if they were streaming anywhere. This pared-down search tool combines these two activities in a nicely streamlined way.

The only external library this site uses is JQuery. The CSS, JS, and HTML file go in a directory (like usual). Based on the HTML inputs, the JS file builds and submits a search query to Discogs using AJAX. The API responds with a JSON, which is parsed and presented as an image grid.

See the note above about Discogs.com OAuth if you're not getting any search results.
