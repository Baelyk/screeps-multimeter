const blessed = require("blessed");

const HELP_TEXT =
  "/filter [include/exclude] [string]  Include/exclude console messages if they contain the string.\n" +
  "/filter                             Disable filtering.";

module.exports = function(multimeter) {
  let filterString = null;
  let include = true;
  let filterCount = 0;

  multimeter.console.on("addLines", function(event) {
    if (filterString && event.type === "log") {
      let line = event.shard + " " + event.line;
      if (
        (include && !line.includes(filterString)) ||
        (!include && line.includes(filterString))
      ) {
        event.skip = true;
        filterCount++;
        multimeter.updateStatus();
      }
    }
  });

  multimeter.addStatus(function() {
    if (filterString) {
      return "FILTERED " + filterCount;
    }
  });

  function commandFilter(args) {
    if (args.length === 0) {
      filterString = null;
    } else {
      include = args.shift() === "include";
      filterString = args.join(" ");
      filterCount = 0;
    }
    multimeter.updateStatus();
  }

  multimeter.addCommand("filter", {
    description: "Filter the console output.",
    helpText: HELP_TEXT,
    handler: commandFilter,
  });

  // Load default filter
  // Set in config as `filter: "[include/exclude] [string]"`
  if (typeof multimeter.config.filter === "string") {
    commandFilter(multimeter.config.filter.split(" "));
  }
};
