import Vue from 'vue';
import Vuex from "vuex";
import stations from 'vbb-stations';

Vue.use(Vuex);

// const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state: {
    count: 0,
    serverConnected: false,
    searchDialogVisible: false,
    logVisible: false,
    graphVisible: false,
    currentSearch: {
      state: "new",
      startStation: {},
      destinationStation: {},
      date: new Date("2020-09-26T13:15:34.045Z"),
      time: "12:00",
      stationRoles: [],
      stationGraphs: {},
      scheduledArrivals: {},
      fullGraph: [],
      lines: [],
      logs: ["Log-Ausgaben erscheinen hier, sobald die Suche gestartet wurde."],
    }
  },
  mutations: {
    increment(state) {
      state.count++
    },
    setStartStation(state, stationId) {
      state.currentSearch.startStation = stations(stationId)[0];
    },
    setDestinationStation(state, stationId) {
      state.currentSearch.destinationStation = stations(stationId)[0];
    },
    setSearchState(state, searchState) {
      state.currentSearch.state = searchState;
    },
    setConnectionState(state, connectionState) {
      state.serverConnected = connectionState;
    },
    showSearchDialog(state) {
      state.searchDialogVisible = true;
    },
    hideSearchDialog(state) {
      state.searchDialogVisible = false;
    },
    showLog(state) {
      state.logVisible = true;
    },
    hideLog(state) {
      state.logVisible = false;
    },
    showGraph(state) {
      state.graphVisible = true;
    },
    hideGraph(state) {
      state.graphVisible = false;
    },
    clearRolesAndLines(state) {
      state.currentSearch.stationRoles = [];
      state.currentSearch.lines = [];
    },
    SOCKET_message(state, message) {
      state.currentSearch.logs.push(message);
    },
    SOCKET_setrole(state, payload) {
      for (var entry of state.currentSearch.stationRoles) {
        if (entry.station.id === payload.station.id) {
          if (entry.role === payload.role) {
            return; // already there, nothing to change
          } else {
            entry.role = payload.role; // update instead of adding
            return;
          }
        }
      }
      state.currentSearch.stationRoles.push(payload);
    },
    SOCKET_setstationgraph(state, payload) {
      state.currentSearch.stationGraphs[payload.stationid] = payload.data;
      state.currentSearch.scheduledArrivals[payload.stationid] = payload.scheduledArrivals;
    },
    SOCKET_setgraph(state, payload) {
      state.currentSearch.fullGraph = payload.data;
    },
    SOCKET_addline(state, payload) {
      state.currentSearch.lines.push(payload);
    }
  },
  actions: {
    setStartStation(context, stationId) {
      context.commit("setStartStation", stationId);
    },
    setDestinationStation(context, stationId) {
      context.commit("setDestinationStation", stationId);
    },
    startSearch(context) {
      const cs = context.state.currentSearch;
      if (!cs.startStation.id) { return; }
      if (!cs.destinationStation.id) { return; }

      context.commit("clearRolesAndLines");
      context.commit("setSearchState", "running");
      var searchRequest = {
        startStation: cs.startStation,
        destinationStation: cs.destinationStation,
        date: cs.date,
        time: cs.time,
      };
      this._vm.$socket.emit("startSearch", searchRequest);
      context.commit("showLog");
    },
  }
})
