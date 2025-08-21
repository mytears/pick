let m_result_list = [];
let m_curr_playing = null;
let m_sound_volume = 1.0;
let m_win_sound_path = "sound/win_04.mp3";
let m_fail_sound_path = "sound/fail_03.mp3";
let m_error_sound_path = "sound/error_01.mp3";
let m_win_sound = null;
let m_fail_sound = null;
let m_error_sound = null;

const once_opts = {
    once: true,
    passive: true
};

function setInit() {
    // 1) 효과음 준비(지금처럼 미리 생성 + preload + load)
    m_win_sound = new Audio(m_win_sound_path);
    m_fail_sound = new Audio(m_fail_sound_path);
    m_error_sound = new Audio(m_error_sound_path);

    [m_win_sound, m_fail_sound, m_error_sound].forEach(a => {
        a.preload = "auto";
        a.load();
    });


    $("#fileUpload").on("change", function (event) {
        var file = event.target.files[0];
        setBgImg(file);
    });
    $(".btn_clear").on("click", function (event) {
        onClickBtnClear(this);
    });
    $(".btn_start").on("click", function (event) {
        onClickBtnStart(this);
    });
    $(".btn_restart").on("click", function (event) {
        onClickBtnRestart(this);
    });
    $(".btn_showall").on("click", function (event) {
        onClickBtnShowAll(this);
    });
    $(".btn_home").on("click", function (event) {

        if (m_curr_playing) {
            m_curr_playing.pause(); // 이전 오디오 중지
            m_curr_playing.currentTime = 0; // Reset time
        }

        onClickBtnHome(this);
    });



    // 3) 한 번만 언락: 마우스/터치/키보드 어느 것이든 첫 입력에
    window.addEventListener("pointerdown", unlockAllSounds, once_opts);
    window.addEventListener("keydown", unlockAllSounds, once_opts);
    window.addEventListener("touchstart", unlockAllSounds, once_opts);

}

// 2) 모든 사운드 언락(최초 사용자 제스처 1번만)
function unlockAllSounds() {
    const all_sounds = [m_win_sound, m_fail_sound, m_error_sound];

    all_sounds.forEach(a => {
        // iOS 등 일부 브라우저에서 소리 나는 재생을 막을 수 있어, 일단 muted로 시도
        a.muted = true;
        const p = a.play();
        if (p && p.then) {
            p.then(() => {
                a.pause();
                a.currentTime = 0;
                a.muted = false;
            }).catch(() => {
                // 실패해도 이후 실제 재생 시에는 정상 동작할 수 있으니 무시
                a.muted = false;
            });
        } else {
            // Promise 미지원 브라우저 대비
            try {
                a.pause();
                a.currentTime = 0;
            } catch (e) {}
            a.muted = false;
        }
    });
}

// 모바일/데스크톱 오디오 언락 (최초 클릭/터치 한 번만)
window.addEventListener("pointerdown", async () => {
    try {
        await failAudio.play();
        failAudio.pause();
        failAudio.currentTime = 0;
    } catch (e) {}
}, {
    once: true
});

function setBgImg(_file) {
    if (_file != null) {
        var reader = new FileReader();
        reader.onload = function (e) {
            //$(".main_page").css("background-image", `url('${e.target.result}')`);
            $(".bg_img").attr("src", e.target.result);
            $(".bg_img_zone").show();
            $(".main_cont").addClass("bg_mode");
//            $(".main_cont").css("background", "#666666");
        };
        reader.readAsDataURL(_file);
    }
}

function onClickBtnHome(_obj) {
    $(".main_page").show();
    $(".sub_page").hide();
}

function onClickBtnClear(_obj) {
    $(".bg_img").attr("src", "");
    $(".bg_img_zone").hide();
//    $(".main_cont").css("background", "lightblue");
    $(".main_cont").removeClass("bg_mode");
}

function onClickBtnShowAll(_obj) {
    for (var i = 0; i < m_result_list.length; i += 1) {
        let _num = i;

        if (m_result_list[_num] == 1) {
            if ($(".box[code=" + _num + "] .box_cover").css("display") != "none") {
                continue;
            }
            setTimeout(() => {
                $(".box[code=" + _num + "] .box_cover").addClass("win");
                $(".box[code=" + _num + "] .box_cover").html("당첨");
                $(".box[code=" + _num + "] .box_cover").show();
            }, 0);
        } else {
            if ($(".box[code=" + _num + "] .box_cover").css("display") != "none") {
                continue;
            }
            setTimeout(() => {
                $(".box[code=" + _num + "] .box_cover").addClass("nowin");
                $(".box[code=" + _num + "] .box_cover").html("꽝");
                $(".box[code=" + _num + "] .box_cover").show();
            }, 0);
        }
    }
}


function onClickBtnRestart(_obj) {
    let t_total = $("#id_total").val();
    let t_win = $("#id_win").val();

    let t_total_num = parseInt(t_total);
    let t_win_num = parseInt(t_win);

    $(".box").each(function () {
        $(this).find(".box_txt").css("font-size", "0px");
    });

    setSubPage(t_total_num, t_win_num);
    $(".main_page").hide();
    $(".sub_page").show();

}


function onClickBtnStart(_obj) {
    let t_total = $("#id_total").val();
    let t_win = $("#id_win").val();

    //console.log(t_total, getChkNum(t_total));
    //console.log(t_win, getChkNum(t_win));
    if (getChkNum(t_total) == false || getChkNum(t_win) == false) {
        m_error_sound.play();
        Swal.fire({
            icon: 'error',
            title: '숫자를 정확히 입력해주세요.',
            target: ".main_cont",
            position: "center",
            customClass: {
                popup: 'alert',
            },
        });
        return;
    }
    let t_total_num = parseInt(t_total);
    let t_win_num = parseInt(t_win);

    if (t_total_num > 100) {
        m_error_sound.play();
        Swal.fire({
            icon: 'error',
            title: '인원은 100명 이하로 설정해주세요.',
            target: ".main_cont",
            position: "center",
            customClass: {
                popup: 'alert',
            },
        });
        return;
    }
    if (t_total_num < t_win_num) {
        //t_win_num = t_total_num;
        m_error_sound.play();
        Swal.fire({
            icon: 'error',
            title: '당첨인원은 참여인원 보다 작거나 같아야 합니다.',
            target: ".main_cont",
            position: "center",
            customClass: {
                popup: 'alert',
            },
        });
        return;
    }

    $(".box").each(function () {
        $(this).find(".box_txt").css("font-size", "0px");
    });

    setSubPage(t_total_num, t_win_num);
    $(".main_page").hide();
    $(".sub_page").show();

}

function getRandomArray(t_total_num, t_win_num) {
    let arr = new Array(t_total_num).fill(0); // 전체 배열을 0으로 초기화

    let indices = Array.from({
        length: t_total_num
    }, (_, i) => i); // 0부터 t_total_num-1까지의 인덱스 배열 생성
    indices = indices.sort(() => Math.random() - 0.5); // 인덱스 배열을 랜덤하게 섞기

    for (let i = 0; i < t_win_num; i++) {
        arr[indices[i]] = 1; // 앞에서 t_win_num 개만큼 1을 할당
    }

    return arr;
}

function setSubPage(t_total_num, t_win_num) {
    m_result_list = [];
    let t_html = "";
    let cols = Math.ceil(Math.sqrt(t_total_num)); // 한 줄의 최대 개수
    let rows = Math.ceil(t_total_num / cols); // 필요한 줄 개수

    $(".box_zone").css({
        "grid-template-columns": `repeat(${cols}, minmax(10px, 1fr))`
    });

    m_result_list = getRandomArray(t_total_num, t_win_num);

    $(".box_zone").html("");

    for (let i = 0; i < t_total_num; i += 1) {
        t_html += "<div class='box' code='" + i + "' onClick='javascript:onClickBox(" + i + ");'>";
        t_html += "    <div class='box_result'>";
        t_html += "        <div class='box_cover' style='display:none;'></div>";
        t_html += "        <div class='box_txt'>" + (i + 1) + "</div>";
        t_html += "    </div>";
        t_html += "</div>";
    }
    $(".box_zone").append(t_html);
    setUpdateFontSize();
}

function setUpdateFontSize() {
    requestAnimationFrame(() => {
        let firstBox = $(".box").first(); // 첫 번째 박스만 기준으로 크기 측정
        if (firstBox.length === 0) return; // 박스가 없으면 종료

        let boxWidth = firstBox.width();
        let boxHeight = firstBox.height();
        let minSize = Math.min(boxWidth, boxHeight);
        let fontSize = minSize * 0.5;
        let coverFontSize = fontSize * 0.85;

        $(".box_txt").css("font-size", fontSize + "px");
        $(".box_cover").css("font-size", coverFontSize + "px");
    });
}


function setUpdateFontSizeOld() {
    setTimeout(() => {
        $(".box").each(function () {
            let boxWidth = $(this).width();
            let boxHeight = $(this).height();
            let minSize = Math.min(boxWidth, boxHeight);
            let fontSize = minSize * 0.5;
            $(this).find(".box_txt").css("font-size", fontSize + "px");
            $(this).find(".box_cover").css("font-size", (fontSize * 0.85) + "px");
        });
    }, 0);
}

function onClickBox(_num) {
    //    console.log(m_result_list[_num]);
    if (m_result_list[_num] == 1) {
        if ($(".box[code=" + _num + "] .box_cover").css("display") != "none") {
            return;
        }
        //        console.log("당첨");
        setSoundPlay(m_win_sound);
        setTimeout(() => {
            $(".box[code=" + _num + "] .box_cover").addClass("win");
            $(".box[code=" + _num + "] .box_cover").html("당첨");
            $(".box[code=" + _num + "] .box_cover").show();
        }, 50);
    } else {
        if ($(".box[code=" + _num + "] .box_cover").css("display") != "none") {
            return;
        }
        //        console.log("꽝");
        setSoundPlay(m_fail_sound);
        setTimeout(() => {
            $(".box[code=" + _num + "] .box_cover").addClass("nowin");
            $(".box[code=" + _num + "] .box_cover").html("꽝");
            $(".box[code=" + _num + "] .box_cover").show();
        }, 50);
    }
}

function getChkNum(_str) {
    return /^\d+$/.test(_str); // 숫자만 있으면 true, 아니면 false
}


// 4) 재생 함수(기존 함수에 살짝 보강)
function setSoundPlay(_sound) {
    try {
        // 충분히 버퍼가 준비되었는지 확인(준비 안됐으면 canplaythrough 후 재생)
        if (_sound.readyState >= 3) { // HAVE_FUTURE_DATA
            _sound.pause();
            _sound.currentTime = 0;
            const p = _sound.play();
            if (p && p.catch) p.catch(() => {});
        } else {
            _sound.addEventListener("canplaythrough", () => {
                _sound.currentTime = 0;
                const p = _sound.play();
                if (p && p.catch) p.catch(() => {});
            }, {
                once: true
            });
        }
    } catch (e) {}
}
