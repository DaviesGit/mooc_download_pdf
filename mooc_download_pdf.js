let csrfKey = '';
let tid = ;

function dwr(url, data, callback) {
	$.ajax({
		url: url,
		method: 'post',
		processData: false,
		contentType: 'text/plain',
		dataType: 'text',
		data: data,
		success: callback,
	});
}

function rpc(url, data, callback) {
	return $.ajax({
		url: url,
		method: 'post',
		dataType: 'text',
		data: data,
		success: callback,
	});
}

function get_chapter(tid, callback) {
	return dwr('https://www.icourse163.org/dwr/call/plaincall/CourseBean.getLastLearnedMocTermDto.dwr',
		'callCount=1\nscriptSessionId=${scriptSessionId}190\nhttpSessionId=\nc0-scriptName=CourseBean\nc0-methodName=getLastLearnedMocTermDto\nc0-id=0\nc0-param0=number:' + tid + '\nbatchId=',
		function(data) {
			data = data.replace(/dwr.engine._remoteHandleCallback\(\'\w+\',\'\w+\',(\{.+\})\);/, 'return $1;');
			data = (new Function(data))();
			callback(data);
		});
}

function get_pdf_url(unit, callback) {
	return dwr('https://www.icourse163.org/dwr/call/plaincall/CourseBean.getLastLearnedMocTermDto.dwr',

		'callCount=1\n' +
		'scriptSessionId=${scriptSessionId}190\n' +
		'httpSessionId=\n' +
		'c0-scriptName=CourseBean\n' +
		'c0-methodName=getLessonUnitLearnVo\n' +
		'c0-id=0\n' +
		'c0-param0=number:' + unit.contentId + '\n' +
		'c0-param1=number:' + unit.contentType + '\n' +
		'c0-param2=number:0\n' +
		'c0-param3=number:' + unit.id + '\n' +
		'batchId=' + (+new Date) + '\n',
		function(data) {
			let url = data.match(/textOrigUrl:"[^"]+"/)[0];
			url = url.substring(13, url.length - 1);
			callback(url);
		});
}


function getLessonUnitLearnVo(unit, callback) {
	return dwr('https://www.icourse163.org/dwr/call/plaincall/CourseBean.getLessonUnitLearnVo.dwr',

		'callCount=1\n' +
		'scriptSessionId=${scriptSessionId}190\n' +
		'httpSessionId=\n' +
		'c0-scriptName=CourseBean\n' +
		'c0-methodName=getLessonUnitLearnVo\n' +
		'c0-id=0\n' +
		'c0-param0=number:' + unit.contentId + '\n' +
		'c0-param1=number:' + unit.contentType + '\n' +
		'c0-param2=number:0\n' +
		'c0-param3=number:' + unit.id + '\n' +
		'batchId=' + (+new Date) + '\n',
		function(data) {
			data = data.replace(/dwr.engine._remoteHandleCallback\(\'\w+\',\'\w+\',(\{.+\})\);/, 'return $1;');
			data = (new Function(data))();
			callback(data);
		});
}


function saveMocContentLearn_v(unit, course, videoTime, finished, index, courseId, learnedVideoTimeCount, callback) {
	return rpc('https://www.icourse163.org/web/j/courseBean.saveMocContentLearn.rpc?csrfKey=' + csrfKey, {
			dto: JSON.stringify({
				unitId: unit.id,
				videoTime: videoTime,
				finished: finished,
				index: index,
				duration: 300000,
				courseId: courseId,
				lessonId: unit.lessonId,
				videoId: unit.contentId,
				termId: unit.termId,
				userId: window.webUser.id,
				contentType: 1,
				learnedVideoTimeCount: learnedVideoTimeCount,
			}, )
		},
		function(data) {
			callback(JSON.parse(data));
		});
}

function saveMocContentLearn_vTimeout(unit, course, videoTime, finished, index, courseId, learnedVideoTimeCount, callback, timeout) {
	return setTimeout(function() {
		saveMocContentLearn_v(unit, course, videoTime, finished, index, courseId, learnedVideoTimeCount, callback)
	}, timeout);
}


function saveMocContentLearn_d(unit, pageNum, finished, callback) {
	return rpc('https://www.icourse163.org/web/j/courseBean.saveMocContentLearn.rpc?csrfKey=' + csrfKey, {
			dto: JSON.stringify({
				unitId: unit.id,
				pageNum: pageNum,
				finished: finished,
				contentType: 3,
			}, )
		},
		function(data) {
			callback(JSON.parse(data));
		});
}

function saveMocContentLearn_dTimeout(unit, pageNum, finished, callback, timeout) {
	return setTimeout(function() {
		saveMocContentLearn_d(unit, pageNum, finished, callback)
	}, timeout);
}


console.log(window.webUser);

// let urls = [];

// get_chapter(1451074447, function(data) {
// 	console.log(data);
// 	let units = [];
// 	data.chapters.forEach((e) => {
// 		e.lessons.forEach((e) => {
// 			e.units.forEach((e) => {
// 				if (3 == e.contentType)
// 					units.push(e);
// 			});
// 		});
// 	});

// 	units.forEach((e, i) => {

// 		get_pdf_url(e, function(url) {
// 			urls[i] = url;
// 		});

// 	});
// });

let units = [];
let chapters = [];
let courseId;
let course = [];
let urls = [];

get_chapter(tid, function(data) {
	data = data.mocTermDto;
	console.log(data);
	courseId = data.courseId;
	data.chapters.forEach((e) => {
		e.lessons.forEach((e) => {
			e.units.forEach((e) => {
				// if (1 == e.contentType || 3 == e.contentType)
				units.push(e);
			});
		});
	});
	chapters = data.chapters;

	units.forEach((e, i) => {
		if (1 === e.contentType) {
			// if (0 === e.viewStatus)
			// getLessonUnitLearnVo(e, function(data) {
			// 	e.detail = data;
			// 	data = data.videoVo;
			// 	course[i] = [e, data];
			// });
		} else if (3 == e.contentType) {
			// if (0 === e.viewStatus)
			// getLessonUnitLearnVo(e, function(data) {
			// 	e.detail = data;
			// 	course[i] = [e, data];
			// });
			get_pdf_url(e, function(url) {
				urls[i] = url;
			});
		} else {
			// getLessonUnitLearnVo(e, function(data) {
			// 	e.detail = data;
			// });
		}
	});
});


// let videos = [];

// chapters.forEach((chapter) => {
// 	chapter.lessons.forEach((lesson) => {
// 		lesson.units.forEach((unit) => {
// 			if (1 == unit.contentType)
// 				videos.push([
// 					[chapter.name, lesson.name, unit.name],
// 					unit.detail.videoVo.mp4HdUrl,
// 				]);
// 		});
// 	});
// });

// let _videos = '';
// videos.forEach(function(e, i) {
// 	_videos += e[1] + '\n\tout=' + (++i < 10 ? '0' + i : i) + '.' + e[0].join('_').replace(/\s+/g, '_') + '\n';
// });

// course = course.filter(function(ele) {
// 	return 0 === ele[0].viewStatus;
// });



pdf_download_txt = '';
urls.forEach(function(url, index) {
	pdf_download_txt += url + '\n';
});
