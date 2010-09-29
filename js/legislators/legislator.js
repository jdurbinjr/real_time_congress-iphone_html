LegislatorView.prototype = new View();
function LegislatorView() {
    var self = this;
    self.containerDiv = 'legislator_body';
    self.titleString = 'Legislator';
    self.subtitleString = '';
    
    self.partyToName = function(party) {
        lookup = {'R':'Republican', 'D':'Democrat', 'I':'Independent'};
        return lookup[party];
    }
    
    self.addToLocal = function(row) {
        application.localDb.transaction(
            function(transaction) {
                transaction.executeSql("INSERT INTO Legislators (bioguide_id, is_favorite, website, firstname, lastname, congress_office, phone, webform, youtube_url, nickname, congresspedia_url, district, title, in_office, senate_class, name_suffix, twitter_id, birthdate, fec_id, state, crp_id, official_rss, gender, party, email, votesmart_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [row.bioguide_id, row.is_favorite, row.website, row.firstname, row.lastname, row.congress_office, row.phone, row.webform, row.youtube_url, row.nickname, row.congresspedia_url, row.district, row.title, row.in_office, row.senate_class, row.name_suffix, row.twitter_id, row.birthdate, row.fec_id, row.state, row.crp_id, row.official_rss, row.gender, row.party, row.email, row.votesmart_id]);
            }
        );
    }
    
    self.dataHandler = function(transaction, results) {
        legislator = results.rows.item(0);
        self.renderLegislator(legislator);
        self.show();
    }
    
    self.renderLegislator = function(legislator) {
        
        //legislator_info
        $('#legislator_photo').attr("src", './images/legislators/' + legislator.bioguide_id + '.jpg');
        $('#legislator_party').html(self.partyToName(legislator.party));
        $('#legislator_state').html(legislator.state);
        $('#legislator_district').html(legislator.district);
        $('#legislator_office').html(legislator.congress_office);        
        $('#legislator_site').html('<a href="' + legislator.website + '">website</a>');
    }
    
    self.dbGetLatest = function(id) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT * FROM Legislators WHERE bioguide_id = ?", [id,], self.dataHandler);
            }
        );
    }

    self.render = function(previous_view) {
        self.setSubtitle(localStorage.getItem("current_legislator_title"));
        self.setTitle(self.titleString);
        self.setLeftButton('back');
        self.setRightButton('reload');
        self.loadThisLegislator(localStorage.getItem("current_legislator"));
    }
    
    self.serverGetLatest = function(id) {
        self.showProgress();
        //fetch committees from server
        jsonUrl = "http://" + application.sunlightServicesDomain + "/api/legislators.get.json?bioguide_id=" + id + "&apikey=" + settings.sunlightServicesKey + "&jsonp=_jqjsp";
        
        $.jsonp({
            url: jsonUrl,
            cache: true,
            timeout: application.ajaxTimeout,
            success: function(data){
                for (i in data.response.legislators) {
                    self.updateLegislator(data.response.legislators[i].legislator);
                    self.addToLocal(data.response.legislators[i].legislator);
                }
                application.markViewed('legislator_' + id);
                self.dbGetLatest(id);
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                application.navAlert("Can't connect to server", "Network Error");
            },
        });
    }
    
    self.loadThisLegislator = function(id) {
        self.dbGetLatest(id);
        /*if (!application.isViewed('legislator_' + id)) {
            self.serverGetLatest(id);
        }*/
    }
    
    self.reload = function() {
        self.serverGetLatest(localStorage.getItem("current_legislator"));
    }
    
    self.updateLegislator = function(row) {
        application.localDb.transaction(
            function(transaction) {
                transaction.executeSql("UPDATE Legislators SET bioguide_id=?, website=?, firstname=?, lastname=?, congress_office=?, phone=?, webform=?, youtube_url=?, nickname=?, congresspedia_url=?, district=?, title=?, in_office=?, senate_class=?, name_suffix=?, twitter_id=?, birthdate=?, fec_id=?, state=?, crp_id=?, official_rss=?, gender=?, party=?, email=?, votesmart_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [row.bioguide_id, row.website, row.firstname, row.lastname, row.congress_office, row.phone, row.webform, row.youtube_url, row.nickname, row.congresspedia_url, row.district, row.title, row.in_office, row.senate_class, row.name_suffix, row.twitter_id, row.birthdate, row.fec_id, row.state, row.crp_id, row.official_rss, row.gender, row.party, row.email, row.votesmart_id]);
            }
        );
    }
}