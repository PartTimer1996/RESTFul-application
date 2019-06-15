const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express()
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
   extended: true
}));

app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/wikiDB', {useNewUrlParser: true});

const wikiSchema =
    { title: String,
        content: String }


const Article = mongoose.model('Article',
    wikiSchema);


//RESTFul API Architecture to follow - GET, POST etc
//app.route allows for the chaining of route handlers i.e GET, POST, etc... for the same route
//REQUESTS TARGETING ALL ARTICLES
app.route('/articles')

//GET - First HTTP verb of the REST API Architecture
    .get(function (req, res)
{
    Article.find({}, function (err, foundArticles) {
        if(!err){
            if(foundArticles){
                res.send(foundArticles)
            }else{
                res.send('No Article Found!')
            }
        }
    });

})

    //POST - Using an API/app called POSTman -
    // Means we don't need to worry about front-end forms
    .post(function (req, res){
        console.log(req.body.title);
        console.log(req.body.content);

        //CREATE - function part of the RESTful architecture
        const newArticle = new Article({
            title: req.body.title,
            content: req.body.content
        });

        newArticle.save(function(err){
            if (!err){
                res.send('sucessfully added post')
            }else{
                res.send('Error: ' + err)
            }
        });
    })

    //DELETE - RESTful API
    .delete(function(req, res){
        Article.deleteMany({} , function (err) {
            if(!err){
                res.send("ALL articles delete - no reverts");
            }else{
                res.send(err);
            }
        });
    });

//REQUESTS TARGETTING SPECIFIC ARTICLE(S)
app.route('/articles/:articleTitle')
//GET one articles given specific title
    .get(function(req,res){

        const foundTitle = req.params.articleTitle;

        Article.findOne({title: foundTitle}, function(err, foundArticle){
           if (!err){
               if(foundArticle){
                   res.send(foundArticle);
               }else {
                   res.send('no article found with the title'  + foundTitle );
               }
           }else{
               res.send(err);
           }
        });

    })
//PUT from the RESTful architecture! - similar to UPDATE From CRUD
// This is the function that completely overwrites the entire document -
    // if one is left blank the property will be DELETED!!
.put(function(req,res){

    const foundTitle = req.params.articleTitle;

    Article.update(
        {title: foundTitle},
        {title: req.body.title, content:req.body.content},
        {overwrite: true},
        function(err){

            if (!err){
                res.send("Article Updated!");
            }else{
                res.send(err);
            }
        });
})
//PATCH - Restful architecture!! - Similar to update by will just update the very specific field
// in a specific document - similar to PUT
.patch(function (req, res) {
        Article.update(
            {title: req.params.articleTitle},
            {$set: req.body},
            function (err) {
                if (!err) {
                    res.send('Successfully updated record!');
                } else {
                    res.send(err);
                }
            });
    })
//Delete specific article for the RESTFul API
    .delete(function(req,res){

        const foundTitle = req.params.articleTitle;

        Article.deleteOne({title: foundTitle}, function(err, foundArticle){
           if (!err){
               if(foundArticle){
                   res.send('Successfully deleted article');
               }else{
                   res.send('did not find the appropriate article');
               }
           } else{
               res.send(err);
           }
        });
    })



app.listen(port, () => console.log(`REST app listening on port ${port}!`))

