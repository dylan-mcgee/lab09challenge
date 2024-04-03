const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

const axios = require("axios");

app.get("/", (req, res) => {
  let endp="http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?shows";
  
  axios.get(endp).then(results => {
          let showsdata = results.data;
          res.render('index', {showsdata});
        }).catch(err => {
            console.log("Error: ", err.message);
   });

});

app.get("/show", (req, res) => {
    let idvalue = req.query.tvid;
    let getshow = `http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?id=${idvalue}`;
    
    console.log(getshow);
    
    axios.get(getshow).then(results => {
        
        let singledata = results.data.show;
        let cast = results.data.cast; // Assuming cast is an array of actors
        let actorsForShow = cast.filter(entry => entry.showid === idvalue);
        singledata.actors = actorsForShow; // Add actors to the singledata object

        // Fetch details for each actor
        let promises = actorsForShow.map(actorEntry => {
            return axios.get(`https://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?actor=${actorEntry.actorid}`);
        });

        // Resolve all promises concurrently
        Promise.all(promises)
            .then(actorResponses => {
                // Extract actor details from responses
                let actorsDetails = actorResponses.map(actorResponse => actorResponse.data);

                // Add actor details to singledata
                singledata.actorsDetails = actorsDetails;

                // Render the details view with singledata
                res.render('details', { singledata });
            })
            .catch(err => {
                console.log("Error fetching actor details: ", err.message);
            });

        }).catch(err => {
            console.log("Error: ", err.message);
    });
});


app.get("/create", (req, res) => {
    res.render('add');
});

app.post("/create", (req, res) => {

    let senttitle = req.body.fieldTitle;
    let sentimg = req.body.fieldImg;
    let sentdes = req.body.fieldDescr;
    const showData = { 
        title: senttitle,
        img: sentimg,
        description: sentdes,
    };

    const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    let epoint="http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?create&apikey=55488546  ";

     axios.post(epoint, showData, config).then((response) => {
           console.log(response.data);
           res.render('add', {showData});
        }).catch((err)=>{
           console.log(err.message);
     });
});

app.get("/top", async (req, res) => {
    
    let topshows = await axios.get("http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?topshows");
    let topactors = await axios.get("http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?topactors");


    let showsdata = topshows.data;
    let actorsdata = topactors.data;


    res.render("topdata", {shows : showsdata , actors: actorsdata});
    
});

app.listen(3000, () => {
    console.log("Server is running at port 3000");
});