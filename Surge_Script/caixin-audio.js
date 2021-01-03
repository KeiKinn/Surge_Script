let body = $response.body;
let res = JSON.parse(body);

let audioList = res.data.list;

for (audioParam in audioList) {
    audioList[audioParam].isFree = changeValue(audioList[audioParam].isFree)
    audioList[audioParam].need_login = changeValue(audioList[audioParam].need_login)
}

function changeValue(val) {
    if (val === 1) {
        val = 0;
    }
    return val;
}

body = JSON.stringify(res)
$done({body})