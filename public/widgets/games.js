export async function football_games(e, t, a, s, l, o, n, r, i) {
    var d = new Headers;
    d.append("x-rapidapi-key", s), d.append("x-rapidapi-host", l);
    var g = {
        method: "GET",
        headers: d,
        redirect: "follow"
    };
    let u = "https://v3.football.api-sports.io/";
    "v3.football.api-sports.io" != l && (u = "https://api-football-v1.p.rapidapi.com/v3/");
    let m = "?";
    null !== e && "" !== e && ("?" !== m && (m += "&"), m += "date=" + e), null !== t && "" !== t && ("?" !== m && (m += "&"), m += "league=" + t), null !== a && "" !== a && ("?" !== m && (m += "&"), m += "season=" + a), m += "&timezone=" + Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
        //const t = await fetch(u + "fixtures" + m, g);
		let apiurl = "/v3_fixtures_by_date.json";
		const t = await fetch(apiurl);
		
        let a, s, l = await t.json(),
            d = document.getElementById("wg-football-data"),
            c = "",
            f = {},
            w = ["1H", "2H", "ET", "P", "LIVE"],
            p = ["HT", "BT"],
            _ = ["FT", "AET", "PEN"],
            b = ["SUSP", "INT", "PST", "CANC", "ABD", "AWD", "WO"],
            h = !1;
        if (null !== e && "" !== e || (h = !0), "true" === o) {
            for (const e in l.errors) console.log(l.errors[e]), c += `\n                    <div class="wg_no_data">${l.errors[e]}</div>\n                `;
            return d.classList.remove("wg_loader"), d.innerHTML = c, !1
        }
        if (0 === l.results) return c += '\n                <div class="wg_no_data">No Games Available</div>\n            ', d.classList.remove("wg_loader"), d.innerHTML = c, !1;
        l.response.sort(function(e, t) {
            return e.fixture.timestamp < t.fixture.timestamp ? -1 : e.fixture.timestamp > t.fixture.timestamp ? 1 : 0
        });
        for (const e in l.response) h ? (f[removeSpace(l.response[e].league.round)] || (f[removeSpace(l.response[e].league.round)] = []), f[removeSpace(l.response[e].league.round)].push(l.response[e])) : (f["football-" + l.response[e].league.id] || (f["football-" + l.response[e].league.id] = []), f["football-" + l.response[e].league.id].push(l.response[e]));
        document.getElementById("wg-football-games") || (c += '\n                <table class="wg-table" id="wg-football-games">\n                    <thead>\n                    </thead>\n            ');
        let x = "",
            $ = "";
        for (const e in f)
            for (const t in f[e]) {
                let l = f[e][t];
                if (!document.getElementById("wg-football-games")) {
                    if ($ !== l.league.id) {
                        let e = `<span data-sport="football" data-league="${l.league.id}" data-season="${l.league.season}" class="wb_header_link wg_load_standings">Standings</span>`;
                        "false" === i && (e = ""), c += `\n                            <tr id="football-league-${l.league.id}">\n                                <td class="wg_header" colspan="8"><img class="wg_flag" src="${l.league.flag}" loading="lazy" onerror='this.style.display="none"'> ${l.league.country}: ${l.league.name} <span data-id="football-league-${l.league.id}" class="wg_arrow wg_arrow_up">&#10095;</span> ${e}</td>\n                            </tr>\n                        `, $ = l.league.id
                    }
                    h && x !== removeSpace(l.league.round) && (c += `\n                                <tr id="football-date-${removeSpace(l.league.round)}">\n                                    <td class="wg_header" colspan="8">${l.league.round} <span data-id="date-${removeSpace(l.league.round)}" class="wg_arrow wg_arrow_up">&#10095;</span></td>\n                                </tr>\n                            `, x = removeSpace(l.league.round))
                }
                let o = l.fixture.status.short;
                "NS" == l.fixture.status.short && (o = time(l.fixture.timestamp)), null === o && (o = ""), null !== l.fixture.status.elapsed && w.includes(l.fixture.status.short) && (o = `<span class="wg_liveTime">${l.fixture.status.elapsed}<span class="wg_progress">'</span></span>`);
                let d, g, u, m, v = null == l.goals.home ? "-" : l.goals.home,
                    y = null == l.goals.away ? "-" : l.goals.away,
                    L = null == l.score.halftime.home ? "" : "(" + l.score.halftime.home + ")",
                    T = null == l.score.halftime.away ? "" : "(" + l.score.halftime.away + ")",
                    E = `<img class="wg_logo" src="${l.teams.home.logo}" loading="lazy" onerror='this.style.display="none"'> ${l.teams.home.name}`,
                    S = `<img class="wg_logo" src="${l.teams.away.logo}" loading="lazy" onerror='this.style.display="none"'> ${l.teams.away.name}`;
                if ("false" === n && (E = `${l.teams.home.name}`, S = `${l.teams.away.name}`), w.includes(l.fixture.status.short) && (d = "wg_liveTime"), p.includes(l.fixture.status.short) && (d = "wg_breakTime"), _.includes(l.fixture.status.short) && (d = "wg_finished"), b.includes(l.fixture.status.short) && (d = "wg_canceled"), v > y && (g = "wg_bolder"), v < y && (u = "wg_bolder"), w.includes(l.fixture.status.short) && (m = "wg_liveTime"), document.getElementById("wg-football-games"))(a = document.getElementById("football-game-" + l.fixture.id)).setAttribute("data-status", l.fixture.status.short), (s = document.getElementById("football-game-status-" + l.fixture.id)).setAttribute("data-text", l.fixture.status.long), s.classList.remove("wg_liveTime"), s.classList.remove("wg_breakTime"), s.classList.remove("wg_finished"), s.classList.remove("wg_canceled"), s.classList.add(d), s.innerHTML = o, (s = document.getElementById("football-game-score-" + l.fixture.id)).classList.remove("wg_liveTime"), s.classList.add(m), s.innerHTML = v + "<br />" + y, (s = document.getElementById("football-game-ht-" + l.fixture.id)).classList.remove("wg_liveTime"), s.classList.add(m), s.innerHTML = L + "<br />" + T, (s = document.getElementById("football-home-" + l.fixture.id)).classList.remove("wg_bolder"), s.classList.add(g), (s = document.getElementById("football-away-" + l.fixture.id)).classList.remove("wg_bolder"), s.classList.add(u);
                else {
                    let e = `<span class="wg_info wg_tooltip wg_tooltip_left wg_load_game" data-sport="football" data-id="${l.fixture.id}" data-text="Show Fixture">?</span>`;
                    "false" === r && (e = ""), c += `\n                        <tr id="football-game-${l.fixture.id}" class="football-league-${l.league.id} date-${removeSpace(l.league.round)} football-games-select" data-status="${l.fixture.status.short}" data-league="${l.league.id}" data-date="${removeSpace(l.league.round)}">\n                            <td id="football-game-status-${l.fixture.id}" class="wg_tooltip wg_width_30 wg_text_center ${d}" data-text="${l.fixture.status.long}">${o}</td>\n                            <td>\n                                <span id="football-home-${l.fixture.id}" class="${g} wg_nowrap">${E}</span>\n                                <br />\n                                <span id="football-away-${l.fixture.id}" class="${u} wg_nowrap">${S}</span>\n                            </td>\n                            <td id="football-game-score-${l.fixture.id}" class="wg_width_20 wg_text_center wg_bolder ${m}">\n                                ${v}\n                                <br />\n                                ${y}\n                            </td>\n                            <td id="football-game-ht-${l.fixture.id}" class="wg_width_20 wg_bolder_300 wg_text_center wg_tooltip wg_tooltip_left ${m}" data-text="Halftime score">\n                                ${L}\n                                <br />\n                                ${T}\n                            </td>\n                            <td class="wg_width_20 wg_text_center">\n                                ${e}\n                            </td>\n                        </tr>\n                    `
                }
            }
        document.getElementById("wg-football-games") || (c += "\n                </table>\n            ", d.classList.remove("wg_loader"), d.innerHTML = c)
    } catch (e) {
        "true" === o && console.log(e)
    }
}

function time(e) {
    let t = new Date(1e3 * e),
        a = t.getHours();
    return a < 10 && (a = "0" + a), a + ":" + ("0" + t.getMinutes()).substr(-2)
}

function _date(e) {
    let t = new Date(1e3 * e),
        a = t.getFullYear(),
        s = t.getMonth() + 1;
    s < 10 && (s = "0" + s);
    let l = t.getDate();
    return l < 10 && (l = "0" + l), a + "-" + s + "-" + l
}

function removeSpace(e) {
    return e = e.replace(/\s+/g, "-").toLowerCase()
}