var aws = require('aws-sdk');
var path = require("path")
var config = require("./config")

var Promise = require("bluebird")
var request = require("superagent")

var s3 = new aws.S3();

s3 = Promise.promisifyAll(s3, {suffix:"WithPromise"})


//List valid pictures that belong to validation steps
const listPicturesToBroadcast = async function(from = 0, pics=[]) {
	const queryParams = {
			picturestatus : [50], //validated by users
			benchsteptype:40, //Validation steps
		}
	console.log("list pictures", from, queryParams)
	return request.get("https://api.grand-shooting.com/v3/picture")
		.query (queryParams)
		.set("offset", from)
		.set("Authorization", "Bearer " + config.token)
		.type("json")
		.then(res => {
			var resPics = res.body
			console.log("resPics", from, resPics.length, resPics[0])
			if(resPics.length == 0) {
				return pics
			} else {
				pics = pics.concat(resPics)
				//We iterate through pagination to get more pictures
				return Promise.delay(250).then(() => listPicturesToBroadcast(from + resPics.length, pics))
			}
		})
}

const getPictureAsBlob = async function(picture) {
	var res = await request.get("https://api.grand-shooting.com/v3" + "/picture/" + picture.picture_id + "/download")
									.set('Authorization', "Bearer " + config.token)
									.responseType('blob')
	return res.body
}

var changePicturestatus = async function(picture, picturestatus ) {
	return request.post("https://api.grand-shooting.com/v3" + "/picture/" + picture.picture_id + "/picturestatus")
				.set("Authorization", "Bearer " + config.token)
				.type("json")
				.send({picturestatus:picturestatus})
				.then(res => {
					return Promise.delay(500)
				}).catch(e => console.error("error", e))
}


var publish = async function() {
	var pics = await listPicturesToBroadcast()

	return Promise.mapSeries(pics, async pic => {
		var blob = await getPictureAsBlob(pic) //Download picture and get result as a binary stream
		var params = {Bucket: config.bucket, ACL:"public-read", Key: config.prefix + "/" + pic.smalltext
								, Body: blob};

		await s3.uploadWithPromise(params) //Upload to S3
		await changePicturestatus(pic, 55) //We mark pictures as published
	})
}

publish()