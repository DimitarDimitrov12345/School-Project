async function football_game(t, e, s, a, l, n = !1) {
    var r = new Headers;
    r.append("x-rapidapi-key", e), r.append("x-rapidapi-host", s);
    var i = {
        method: "GET",
        headers: r,
        redirect: "follow"
    };
    let o = "https://v3.football.api-sports.io/";
    "v3.football.api-sports.io" != s && (o = "https://api-football-v1.p.rapidapi.com/v3/");
    let d = "?";
    null !== t && "" !== t && ("?" !== d && (d += "&"), d += "id=" + t), d += "&timezone=" + Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
        let apiurl = `/saved-fixtures/fixture_${t}.json`;
        console.log('Fetching fixture from:', apiurl);
        const response = await fetch(apiurl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let e = await response.json();
        console.log('Fixture data loaded:', e);
        let s = document.getElementById("wg-api-football-game"),
            r = "div";
        n && (s = document.getElementById("wb-football-modal-data"), r = "modal");
        let g = "wg-football-game-" + r,
            _ = "";
        if ("true" === a) {
            for (const t in e.errors) console.log(e.errors[t]), _ += `\n                    <div class="wg_no_data">${e.errors[t]}</div>\n                `;
            return s.classList.remove("wg_loader"), s.innerHTML = _, !1
        }
        if (0 === e.results) return _ += '\n                <div class="wg_no_data">No Data Available</div>\n            ', s.classList.remove("wg_loader"), s.innerHTML = _, !1;
        for (const t in e.response) {
            let s = e.response[t],
                a = ["1H", "2H", "ET", "P", "LIVE"],
                n = ["HT", "BT"],
                i = ["FT", "AET", "PEN"],
                o = ["SUSP", "INT", "PST", "CANC", "ABD", "AWD", "WO"],
                d = `<div class="wb_img_block"><img class="wg_logo_game" src="${s.teams.home.logo}" loading="lazy" onerror='this.style.display="none"'></div>`,
                c = `<div class="wb_img_block"><img class="wg_logo_game" src="${s.teams.away.logo}" loading="lazy" onerror='this.style.display="none"'></div>`;
            "false" === l && (d = "", c = "");
            let p, w, m, u = null == s.goals.home ? "" : s.goals.home,
                f = null == s.goals.away ? "" : s.goals.away;
            u > f && (p = "wg_bolder"), u < f && (w = "wg_bolder"), a.includes(s.fixture.status.short) && (m = "wg_liveTime");
            let y, b = "";
            null !== s.fixture.status.elapsed && a.includes(s.fixture.status.short) && (b = `- <span class="wg_liveTime">${s.fixture.status.elapsed}<span class="wg_progress">'</span></span>`), a.includes(s.fixture.status.short) && (y = "wg_liveTime"), n.includes(s.fixture.status.short) && (y = "wg_finished"), i.includes(s.fixture.status.short) && (y = "wg_finished"), o.includes(s.fixture.status.short) && (y = "wg_canceled");
            let x, h, $, v, I = null == s.fixture.venue.name ? "" : s.fixture.venue.name,
                L = null == s.fixture.venue.city ? "" : s.fixture.venue.city,
                T = null == s.fixture.referee ? "" : '<i class="icon-svg icon-whistle"></i> ' + s.fixture.referee;
            0 === s.events.length && (x = "wg_hide"), 0 === s.statistics.length && (h = "wg_hide"), 0 === s.lineups.length && ($ = "wg_hide"), 0 === s.players.length && (v = "wg_hide");
            let E = events(s.events, s.teams.home.id, s.teams.away.id, s.score, s.goals.home, s.goals.away),
                X = statistics(s.statistics, s.teams.home.id, s.teams.away.id),
                B = lineups(s.lineups, s.teams.home.id, s.teams.away.id, r),
                P = players(s.players, l);
            if (document.getElementById(g)) {
                let t;
                (t = document.getElementById("football-game-" + r + "-status-" + s.fixture.id)).classList.remove("wg_liveTime"), t.classList.remove("wg_finished"), t.classList.remove("wg_canceled"), t.classList.add(y), t.innerHTML = s.fixture.status.long + " " + b, (t = document.getElementById("football-game-" + r + "-score-" + s.fixture.id)).classList.remove("wg_liveTime"), t.classList.add(m), t.innerHTML = u + " - " + f, (t = document.getElementById("football-" + r + "-home-" + s.fixture.id)).classList.remove("wg_bolder"), t.classList.add(p), (t = document.getElementById("football-" + r + "-away-" + s.fixture.id)).classList.remove("wg_bolder"), t.classList.add(w), (t = document.getElementById("football-game-" + r + "-events-button-" + s.fixture.id)).classList.remove("wg_hide"), t.classList.add(x), (t = document.getElementById("football-game-" + r + "-statistics-button-" + s.fixture.id)).classList.remove("wg_hide"), t.classList.add(h), (t = document.getElementById("football-game-" + r + "-lineups-button-" + s.fixture.id)).classList.remove("wg_hide"), t.classList.add($), (t = document.getElementById("football-game-" + r + "-players-button-" + s.fixture.id)).classList.remove("wg_hide"), t.classList.add(v), (t = document.getElementById("football-game-" + r + "-events-" + s.fixture.id)).innerHTML = E, (t = document.getElementById("football-game-" + r + "-statistics-" + s.fixture.id)).innerHTML = X, (t = document.getElementById("football-game-" + r + "-lineups-" + s.fixture.id)).innerHTML = B, (t = document.getElementById("football-game-" + r + "-players-" + s.fixture.id)).innerHTML = P
            } else _ += `\n                    <table class="wg-table" id="${g}">\n                        <tr>\n                            <td class="wg_header" colspan="2"><img class="wg_flag" src="${s.league.flag}" loading="lazy" onerror='this.style.display="none"'> ${s.league.country}: ${s.league.name}</td>\n                            <td class="wg_header wg_text_right">${s.league.round}</td>\n                        </tr>\n                        <tr>\n                            <td class="wg_text_center wg_width_33_p wg_no_border"><br /><br />${d}</td>\n                            <td class="wg_text_center wg_width_34_p wg_no_border" rowspan="2">\n                                <br />\n                                ${_date(s.fixture.timestamp)} ${time(s.fixture.timestamp)}\n                                <br />\n                                <br />\n                                <br />\n                                <span id="football-game-${r}-score-${s.fixture.id}" class="wg_modal_score ${m}">${u} - ${f}</span>\n                                <br />\n                                <br />\n                                <br />\n                                <span id="football-game-${r}-status-${s.fixture.id}" class="${y}">${s.fixture.status.long} ${b}</span>\n                            </td>\n                            <td class="wg_text_center wg_width_33_p wg_no_border"><br /><br />${c}</td>\n                        </tr>\n                        <tr>\n                            <td id="football-${r}-home-${s.fixture.id}" class="wg_text_center ${p} wg_no_border wg_modal_team">${s.teams.home.name}</td>\n                            <td id="football-${r}-away-${s.fixture.id}" class="wg_text_center ${w} wg_no_border wg_modal_team">${s.teams.away.name}</td>\n                        </tr>\n                        <tr>\n                            <td class="wg_text_center wg_no_border" colspan="3"><br />${I} <b>${L}</b></td>\n                        </tr>\n                        <tr>\n                            <td class="wg_text_center wg_no_border" colspan="3">${T}</td>\n                        </tr>\n                        <tr>\n                            <td class="wg_header" colspan="3">\n                                <span id="football-game-${r}-events-button-${s.fixture.id}" class="wg_button_toggle_game wg_active ${x}" data-select="events" data-sport="football" data-id="${s.fixture.id}" data-sub="${r}">Events</span>\n                                <span id="football-game-${r}-statistics-button-${s.fixture.id}" class="wg_button_toggle_game ${h}" data-select="statistics" data-sport="football" data-id="${s.fixture.id}" data-sub="${r}">Statistics</span>\n                                <span id="football-game-${r}-lineups-button-${s.fixture.id}" class="wg_button_toggle_game ${$}" data-select="lineups" data-sport="football" data-id="${s.fixture.id}" data-sub="${r}">Lineups</span>\n                                <span id="football-game-${r}-players-button-${s.fixture.id}" class="wg_button_toggle_game ${v}" data-select="players" data-sport="football" data-id="${s.fixture.id}" data-sub="${r}">Players</span>\n                            </td>\n                        </tr>\n                    </table>\n                    <table class="wg-table wg_data_toggle_game" id="football-game-${r}-events-${s.fixture.id}" data-id="${s.fixture.id}">\n                        ${E}\n                    </table>\n                    <table class="wg-table wg_data_toggle_game wg_hide" id="football-game-${r}-statistics-${s.fixture.id}" data-id="${s.fixture.id}">\n                        ${X}\n                    </table>\n                    <table class="wg-table wg_data_toggle_game wg_hide" id="football-game-${r}-lineups-${s.fixture.id}" data-id="${s.fixture.id}">\n                        ${B}\n                    </table>\n                    <table class="wg-table wg_data_toggle_game wg_hide" id="football-game-${r}-players-${s.fixture.id}" data-id="${s.fixture.id}">\n                        ${P}\n                    </table>\n                `
        }
        document.getElementById(g) || (s.classList.remove("wg_loader"), s.innerHTML = _)
    } catch (t) {
        "true" === a && console.log(t)
    }
}

function time(t) {
    let e = new Date(1e3 * t),
        s = e.getHours();
    return s < 10 && (s = "0" + s), s + ":" + ("0" + e.getMinutes()).substr(-2)
}

function _date(t) {
    let e = new Date(1e3 * t),
        s = e.getFullYear(),
        a = e.getMonth() + 1;
    a < 10 && (a = "0" + a);
    let l = e.getDate();
    return l < 10 && (l = "0" + l), s + "-" + a + "-" + l
}

function events(t, e, s, a, l, n) {
    let r = !1,
        i = !1,
        o = !1,
        d = !1,
        g = "";
    for (let _ in t) {
        if (!1 === r && t[_].time.elapsed >= 0 && t[_].time.elapsed <= 45) {
            r = !0, g += `\n                <tr>\n                    <td class="wg_header wg_text_center">${null==a.halftime.home?"First Half":"First Half ("+a.halftime.home+" - "+a.halftime.away+")"}</td>\n                </tr>\n            `
        }
        if (!1 === i && t[_].time.elapsed > 45 && t[_].time.elapsed <= 90) {
            i = !0, g += `\n                <tr>\n                    <td class="wg_header wg_text_center">${null==a.fulltime.home?"Second Half ("+l+" - "+n+")":"Second Half ("+a.fulltime.home+" - "+a.fulltime.away+")"}</td>\n                </tr>\n            `
        }
        if (!1 === o && t[_].time.elapsed > 90) {
            o = !0, g += `\n                <tr>\n                    <td class="wg_header wg_text_center">${null==a.extratime.home?"Extra Time ("+l+" - "+n+")":"Extra Time ("+a.extratime.home+" - "+a.extratime.away+")"}</td>\n                </tr>\n            `
        }
        if (!1 === d && "Penalty Shootout" === t[_].comments) {
            d = !0, g += `\n                <tr>\n                    <td class="wg_header wg_text_center">${null==a.penalty.home?"Penalty Shootout":"Penalty Shootout ("+a.penalty.home+" - "+a.penalty.away+")"}</td>\n                </tr>\n            `
        }
        let c;
        if ("Goal" == t[_].type && ("Normal Goal" == t[_].detail && (c = "icon-soccer-ball"), "Penalty" == t[_].detail && (c = "icon-soccer-ball-penalty"), "Missed Penalty" == t[_].detail && (c = "icon-soccer-ball-missed-penalty"), "Own Goal" == t[_].detail && (c = "icon-soccer-ball-own-goal")), "Card" == t[_].type && ("Yellow Card" == t[_].detail && (c = "icon-yellow-card"), "Second Yellow Card" == t[_].detail && (c = "icon-red-card"), "Red Card" == t[_].detail && (c = "icon-red-card")), "subst" == t[_].type && (c = "icon-substitution"), "Var" == t[_].type && (c = "icon-whistle"), t[_].team.id === e) {
            g += "<tr><td>";
            let e = null == t[_].time.elapsed ? "" : t[_].time.elapsed + "'",
                s = null == t[_].player.name ? "" : t[_].player.name,
                a = null == t[_].assist.name ? "" : t[_].assist.name,
                l = null == t[_].comments ? "" : t[_].comments;
            g += `\n                <span class="wg_p_lr_2 wg_tooltip" data-text="${t[_].detail}">\n                    ${e}\n                    <i class="icon-svg ${c}"></i>\n                    <span class="wg_p_lr_2 wg_bolder">${s}</span>\n                    <span class="wg_p_lr_2">${a}</span>\n                    <span class="wg_p_lr_2">${l}</span>\n                </span>\n            `
        }
        if (t[_].team.id === s) {
            g += '<tr><td class="wg_text_right">';
            let e = null == t[_].time.elapsed ? "" : t[_].time.elapsed + "'",
                s = null == t[_].player.name ? "" : t[_].player.name,
                a = null == t[_].assist.name ? "" : t[_].assist.name,
                l = null == t[_].comments ? "" : t[_].comments;
            g += `\n                <span class="wg_p_lr_2 wg_tooltip wg_tooltip_left" data-text="${t[_].detail}">\n                    <span class="wg_p_lr_2">${l}</span>\n                    <span class="wg_p_lr_2">${a}</span>\n                    <span class="wg_p_lr_2 wg_bolder">${s}</span>\n                    <i class="icon-svg ${c}"></i>\n                    ${e}\n                </span>\n            `
        }
        g += "</td></tr>"
    }
    return g
}

function statistics(t, e, s) {
    let a = {};
    for (let e in t) {
        let s = t[e].team.id;
        for (let l in t[e].statistics) a[t[e].statistics[l].type] || (a[t[e].statistics[l].type] = {}), a[t[e].statistics[l].type][s] || (a[t[e].statistics[l].type][s] = {}), a[t[e].statistics[l].type][s] = t[e].statistics[l].value
    }
    let l = "";
    for (let t in a) {
        l += `\n            <tr>\n                <td class="wg_width_33_p wg_p_lr_5 wg_no_border">${null===a[t][e]?"":a[t][e]}</td>\n                <td class="wg_width_34_p wg_no_border wg_text_center wg_bolder" colspan="2">${t}</td>\n                <td class="wg_width_33_p wg_p_lr_5 wg_no_border wg_text_right">${null===a[t][s]?"":a[t][s]}</td>\n            </tr>\n        `;
        let n = parseInt(a[t][e]) + parseInt(a[t][s]);
        0 == n && (n = 1);
        let r = 100 * parseInt(a[t][e]) / n,
            i = 100 * parseInt(a[t][s]) / n;
        null === a[t][e] && (r = 0), null === a[t][s] && (i = 0);
        let o = "wg_progress_bar_red",
            d = "wg_progress_bar_red";
        r > i ? o = "wg_progress_bar_green" : d = "wg_progress_bar_green", l += `\n            <tr>\n                <td colspan="2" class="wg_no_border wg_width_50_p">\n                    <div class="wg_progress_bar wg_progress_bar_home">\n                        <div class="${o}" style="width:${r}%">\n                    </div>\n                </td>\n                <td colspan="2" class="wg_no_border wg_width_50_p">\n                    <div class="wg_progress_bar">\n                        <div class="${d}" style="width:${i}%"></div>\n                    </div>\n                </td>\n            </tr>\n        `
    }
    return l
}

function lineups(t, e, s, a) {
    let l, n, r, i, o, d, g, _, c, p, w, m, u, f, y = "",
        b = 500;
    "div" == a && document.getElementById("wg-api-football-game") && (b = document.getElementById("wg-api-football-game").offsetWidth), "modal" == a && document.getElementById("wg-api-football-games") && ((b = window.innerWidth) < 680 ? (b *= .9, b -= 30) : b >= 1024 ? (b *= .5, b -= 30) : b >= 680 && (b *= .75, b -= 30));
    let x = "#01d099",
        h = "#fff",
        $ = "#f64e60",
        v = "#fff",
        I = !1,
        L = !1;
    for (let a in t) {
        if (t[a].team.id == e && null !== t[a].formation) {
            t[a].team.colors.player.primary && (x = "#" + t[a].team.colors.player.primary), t[a].team.colors.player.border && (h = "#" + t[a].team.colors.player.border), r = [];
            for (let e in t[a].startXI) null !== t[a].startXI[e].player.grid && (I = !0, d = (o = t[a].startXI[e].player.grid.split(":"))[0] - 1, g = o[1] - 1, r[d] || (r[d] = []), r[d][g] = t[a].startXI[e].player.name);
            m = b / r.length / 2
        }
        if (t[a].team.id == s && null !== t[a].formation) {
            t[a].team.colors.player.primary && ($ = "#" + t[a].team.colors.player.primary), t[a].team.colors.player.border && (v = "#" + t[a].team.colors.player.border), i = [];
            for (let e in t[a].startXI) null !== t[a].startXI[e].player.grid && (L = !0, d = (o = t[a].startXI[e].player.grid.split(":"))[0] - 1, g = o[1] - 1, i[d] || (i[d] = []), i[d][g] = t[a].startXI[e].player.name);
            u = b / i.length / 2
        }
    }
    if (!0 === I && !0 === L) {
        y += `\n            <tr>\n                <td class="wg_grid" height="${.65*b+"px"}" colspan="2">\n        `, p = 0;
        for (let t in r) {
            _ = 0, 1 === r[t].length && (f = 50), 2 === r[t].length && (f = 33), 3 === r[t].length && (f = 25), 4 === r[t].length && (f = 20), 5 === r[t].length && (f = 16.67), 6 === r[t].length && (f = 7);
            for (let e in r[t]) y += `\n                    <span class="wg_absolute wg_text_center" style="top:${_+=f}%;left:${p}px">\n                        <span class="wg_grid_player wg_tooltip" data-text="${r[t][e]}" style="background:${x}; border: 2px solid ${h}"></span>\n                    </span>\n                `;
            p += m
        }
        w = b / 2 - u;
        for (let t in i.reverse()) {
            c = 0, 1 === i[t].length && (f = 50), 2 === i[t].length && (f = 33), 3 === i[t].length && (f = 25), 4 === i[t].length && (f = 20), 5 === i[t].length && (f = 16.67), 6 === i[t].length && (f = 7);
            for (let e in i[t]) y += `\n                    <span class="wg_absolute wg_text_center" style="bottom:${c+=f}%;right:${w}px">\n                        <span class="wg_grid_player wg_tooltip wg_tooltip_left" data-text="${i[t][e]}" style="background:${$}; border: 2px solid ${v};transform: translateY(50%)translateX(-75%);"></span>\n                    </span>\n                `;
            w -= u
        }
        y += "\n            </td>\n        </tr>\n        "
    }
    y += '\n        <tr>\n            <td class="wg_text_center wg_header" colspan="2">Coaches</td>\n        </tr>\n        <tr>\n    ';
    for (let a in t) t[a].team.id == e && (y += `\n                <td class="wg_text_center">${t[a].coach.name}</td>\n            `), t[a].team.id == s && (y += `\n                <td class="wg_text_center">${t[a].coach.name}</td>\n            `);
    y += '\n        </tr>\n        <tr>\n            <td class="wg_text_center wg_header" colspan="2">Formations</td>\n        </tr>\n        <tr>\n    ';
    for (let a in t) t[a].team.id == e && (y += `\n                <td class="wg_text_center">${t[a].formation}</td>\n            `), t[a].team.id == s && (y += `\n                <td class="wg_text_center">${t[a].formation}</td>\n            `);
    y += '\n        </tr>\n        <tr>\n            <td class="wg_text_center wg_header" colspan="2">Start XI</td>\n        </tr>\n        <tr>\n    ';
    for (let a in t) {
        if (t[a].team.id == e) {
            y += "\n                <td>\n            ";
            for (let e in t[a].startXI) l = "", null !== t[a].startXI[e].player.pos && (l = t[a].startXI[e].player.pos), n = "", null !== t[a].startXI[e].player.number && (n = " <span>(" + t[a].startXI[e].player.number + ")</span>"), y += `\n                    <div>\n                        <span class="wg_bolder">${l} </span> ${t[a].startXI[e].player.name} ${n}\n                    </div>\n                `;
            y += "\n                </td>\n            "
        }
        if (t[a].team.id == s) {
            y += "\n                <td>\n            ";
            for (let e in t[a].startXI) l = "", null !== t[a].startXI[e].player.pos && (l = t[a].startXI[e].player.pos), n = "", null !== t[a].startXI[e].player.number && (n = " <span>(" + t[a].startXI[e].player.number + ")</span>"), y += `\n                    <div class="wg_text_right">\n                        ${n} ${t[a].startXI[e].player.name} <span class="wg_bolder">${l} </span>\n                    </div>\n                `;
            y += "\n                </td>\n            "
        }
    }
    y += '\n        </tr>\n        <tr>\n            <td class="wg_text_center wg_header" colspan="2">Substitutes</td>\n        </tr>\n        <tr>\n    ';
    for (let a in t) {
        if (t[a].team.id == e) {
            y += "\n                <td>\n            ";
            for (let e in t[a].substitutes) l = "", null !== t[a].substitutes[e].player.pos && (l = t[a].substitutes[e].player.pos), n = "", null !== t[a].substitutes[e].player.number && (n = " <span>(" + t[a].substitutes[e].player.number + ")</span>"), y += `\n                    <div>\n                        <span class="wg_bolder">${l} </span> ${t[a].substitutes[e].player.name} ${n}\n                    </div>\n                `;
            y += "\n                </td>\n            "
        }
        if (t[a].team.id == s) {
            y += "\n                <td>\n            ";
            for (let e in t[a].substitutes) l = "", null !== t[a].substitutes[e].player.pos && (l = t[a].substitutes[e].player.pos), n = "", null !== t[a].substitutes[e].player.number && (n = " <span>(" + t[a].substitutes[e].player.number + ")</span>"), y += `\n                    <div class="wg_text_right">\n                        ${n} ${t[a].substitutes[e].player.name} <span class="wg_bolder">${l} </span>\n                    </div>\n                `;
            y += "\n                </td>\n            "
        }
    }
    return y += "\n        </tr>\n    "
}

function players(t, e) {
    let s = "";
    for (let a in t) {
        let l = `<img class="wg_logo wg_hide_xs" src="${t[a].team.logo}" alt="${t[a].team.name} logo" onerror='this.style.display="none"' loading="lazy">`;
        "false" === e && (l = ""), s += `\n            <tr>\n                <td class="wg_header">\n                    ${l}\n                    <span class="wg_nowrap">${t[a].team.name}</span>\n                </td>\n                <td class="wg_header wg_text_center wg_tooltip wg_hide_xxs" data-text="Position">P</td>\n                <td class="wg_header wg_text_center wg_tooltip" data-text="Rating">R</td>\n                <td class="wg_header wg_text_center wg_tooltip" data-text="Minutes Played">M</td>\n                <td class="wg_header wg_text_center wg_tooltip" data-text="Goals">G</td>\n                <td class="wg_header wg_text_center wg_tooltip" data-text="Goals Assists">GA</td>\n                <td class="wg_header wg_text_center wg_tooltip wg_hide_xs" data-text="Total Shots">TS</td>\n                <td class="wg_header wg_text_center wg_tooltip wg_hide_xs" data-text="Shots On">SO</td>\n                <td class="wg_header wg_text_center wg_tooltip wg_hide_xxs" data-text="Goals Conceded">GC</td>\n                <td class="wg_header wg_text_center wg_tooltip wg_hide_xs" data-text="Goals Saves">GS</td>\n                <td class="wg_header wg_text_center wg_tooltip wg_tooltip_left" data-text="Total Passes">TP</td>\n                <td class="wg_header wg_text_center wg_tooltip wg_hide_xs wg_tooltip_left" data-text="Key Passes">KP</td>\n                <td class="wg_header wg_text_center wg_tooltip wg_hide_xs wg_tooltip_left" data-text="Passes Accuracy">PA</td>\n                <td class="wg_header wg_text_center wg_tooltip wg_tooltip_left" data-text="Yellow Cards">YC</td>\n                <td class="wg_header wg_text_center wg_tooltip wg_tooltip_left" data-text="Red Cards">RC</td>\n            </tr>\n        `, t[a].players.sort(function(t, e) {
            return t.statistics[0].games.rating > e.statistics[0].games.rating ? -1 : t.statistics[0].games.rating < e.statistics[0].games.rating ? 1 : 0
        });
        for (let l in t[a].players) {
            let n = null == t[a].players[l].statistics[0].games.position ? "" : t[a].players[l].statistics[0].games.position,
                r = null == t[a].players[l].statistics[0].games.rating ? "" : t[a].players[l].statistics[0].games.rating,
                i = null == t[a].players[l].statistics[0].games.minutes ? "" : t[a].players[l].statistics[0].games.minutes,
                o = null == t[a].players[l].statistics[0].goals.total ? "" : t[a].players[l].statistics[0].goals.total,
                d = null == t[a].players[l].statistics[0].goals.assists ? "" : t[a].players[l].statistics[0].goals.assists,
                g = null == t[a].players[l].statistics[0].shots.total ? "" : t[a].players[l].statistics[0].shots.total,
                _ = null == t[a].players[l].statistics[0].shots.on ? "" : t[a].players[l].statistics[0].shots.on,
                c = null == t[a].players[l].statistics[0].goals.conceded ? "" : t[a].players[l].statistics[0].goals.conceded,
                p = null == t[a].players[l].statistics[0].goals.saves ? "" : t[a].players[l].statistics[0].goals.saves,
                w = null == t[a].players[l].statistics[0].passes.total ? "" : t[a].players[l].statistics[0].passes.total,
                m = null == t[a].players[l].statistics[0].passes.key ? "" : t[a].players[l].statistics[0].passes.key,
                u = null == t[a].players[l].statistics[0].passes.accuracy ? "" : t[a].players[l].statistics[0].passes.accuracy,
                f = null == t[a].players[l].statistics[0].cards.yellow ? "" : t[a].players[l].statistics[0].cards.yellow,
                y = null == t[a].players[l].statistics[0].cards.red ? "" : t[a].players[l].statistics[0].cards.red,
                b = `<img class="wg_logo wg_p_lr_2 wg_hide_xs" src="${t[a].players[l].player.photo}" alt="${t[a].players[l].player.name} photo" onerror='this.style.display="none"' loading="lazy">`;
            "false" === e && (b = ""), s += `\n                <tr>\n                    <td>\n                        ${b}\n                        <span class="wg_nowrap">${t[a].players[l].player.name}</span>\n                    </td>\n                    <td class="wg_text_center wg_hide_xxs">${n}</td>\n                    <td class="wg_text_center">${r}</td>\n                    <td class="wg_text_center">${i}</td>\n                    <td class="wg_text_center">${o}</td>\n                    <td class="wg_text_center">${d}</td>\n                    <td class="wg_text_center wg_hide_xs">${g}</td>\n                    <td class="wg_text_center wg_hide_xs">${_}</td>\n                    <td class="wg_text_center wg_hide_xxs">${c}</td>\n                    <td class="wg_text_center wg_hide_xs">${p}</td>\n                    <td class="wg_text_center">${w}</td>\n                    <td class="wg_text_center wg_hide_xs">${m}</td>\n                    <td class="wg_text_center wg_hide_xs">${u}</td>\n                    <td class="wg_text_center">${f}</td>\n                    <td class="wg_text_center">${y}</td>\n                </tr>\n            `
        }
    }
    return s
}