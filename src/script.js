window.addEventListener('load', function () {
    // Prevent the page from reloading when form is submitted
    var form = document.getElementById("form");
    function handleForm(event) {
      event.preventDefault();
    }
    form.addEventListener("submit", handleForm);
    // Call the predict function when button is clicked
    document.querySelector("#predict-btn").addEventListener("click", predict);

    function predict() {
      // Get various values entered by user
      let a = parseFloat(document.querySelector("#age").value);
      let h = parseFloat(document.querySelector("#height").value);
      let w_0 = parseFloat(document.querySelector("#weight").value);
      let s, f;
      let sex_value = document.querySelector("input[name=sex]:checked").value;
      let activity_value = document.querySelector("#activity").value;
      let n = parseFloat(document.querySelector("#diet").value);

      if (isNaN(n) || isNaN(h) || isNaN(w_0) || isNaN(a) || sex_value === "") {
          return;
      }

      // Set value based on sex
      if (sex_value === "female") {
        s = -161;
      } else {
        s = 5;
      }

      // Set activity value based on selected activity
      switch (activity_value) {
        case "sedentary":
          f = 1.2;
          break;
        case "light-exercise":
          f = 1.3;
          break;
        case "moderate-exercise":
          f = 1.5;
          break;
        case "heavy-exercise":
          f = 1.7;
          break;
        case "v-heavy-exercise":
          f = 1.9;
          break;
        default:
          f = 1.2;
          break;
      }

      // Calculate the integration constant
      let k = (n - f * (6.25 * h - 5 * a + s)) / (10 * f);
      let c = w_0 - k;

      let table_start = `
            <table>
              <tr>
              <th>Month</th>
              <th>Weight (kg)</th>
              <th>Monthly change (kg)</th>
              <th>Total change (kg)</th>
              </tr>`;
      let table_end = `</table>`;
      let table_data = "";
      let w_t;
      // dataset to be used for line chart
      let weightTime = [{time: 0, weight: w_0}];

      let textColor;
      // Calculate the monthly weight
      
      for (let j = 1; j < 101; j++) {
        // Using the assumption that one month is 30 days
        let t = j * 30;
        w_t = c * Math.exp((f * t) / -770) + k;
        // Rounding to 2 decimal places
        w_t = Math.round((w_t + Number.EPSILON) * 100) / 100;

        // Create and insert object
        let obj = {
          time: j,
          weight: w_t,
        };
        // Populate the line chart dataset
        weightTime.push(obj);
        
        let prev_t = (j - 1) * 30;
        let prev_w_t = c * Math.exp((f * prev_t) / -770) + k;
        let diff_w_t = w_t - prev_w_t;
        let diff_w_t_round =
          Math.round((diff_w_t + Number.EPSILON) * 100) / 100;
        let diff_w_0 = w_t - w_0;
        let diff_w_0_round =
          Math.round((diff_w_0 + Number.EPSILON) * 100) / 100;

        let sign;
        /* If the weight change is less than starting weight,
        give text a class corresponding to red color . Otherwise,
        green text*/
        /* Put plus sign in front of positive values */

        if (diff_w_t < 0) {
          textColor = "red";
          sign = "";
        }else {
          textColor = "green";
          sign = "+";
        }

        table_data += `
            <tr>
            <td> ${j}</td>
            <td>${w_t}</td>
            <td class="${textColor}">${sign}${diff_w_t_round}</td>
            <td class="${textColor}">${sign}${diff_w_0_round}</td>
            </tr>`;
      }

      let table = table_start + table_data + table_end;
      table = new DOMParser().parseFromString(table, "text/xml");
      const output = document.getElementById("table");
      if (output.innerHTML) {
        // Prevent multiple tables from being added
        // Force every added table to replace previous table
        output.innerHTML = "";
        output.appendChild(table.documentElement);
      } else {
        output.appendChild(table.documentElement);
      }
      // Workaround to fix table layout bug
      table = output.innerHTML;
      output.innerHTML = table;

      /* Creating the bar chart */
      // set the dimensions of the graph
        width = Math.min(800, window.innerWidth/1.1)
        height = Math.max(width, 600);

      // append the svg object to the body of the page
      document.getElementById("line-chart").innerHTML = "";
      var svg = d3
        .select("#line-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)

        let lastEl = weightTime[weightTime.length -1]

        // Calculate the axis values
        var xScale = d3.scaleLinear().domain([0, lastEl.time + 1]).range([0, width/1.2]),
            yScale = d3.scaleLinear().domain([Math.min(w_0-5, lastEl.weight-5), Math.max(w_0+2, lastEl.weight+2)]).range([height/1.2, 0]);
            
        var g = svg.append("g")
            .attr("transform", "translate(" + 50 + "," + 50 + ")");

        
        // X-axis label
        svg.append('text')
        .attr('x', width/2.2)
        .attr('y', height/1.05+10)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', 10)
        .style('font-weight', 'bold')
        .text('Time in months');
        
        // Y-axis label
        svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(20,' + height/2 + ')rotate(-90)')
        .style('font-family', 'Helvetica')
        .style('font-size', 10)
        .style('font-weight', 'bold')
        .text('Weight in kilograms');


        // X-axis scale
        g.append("g")
         .attr("transform", "translate(0," + height/1.2 + ")")
         .call(d3.axisBottom(xScale));
        
        g.append("g")
         .call(d3.axisLeft(yScale));
        
         // Dots
        svg.append('g')
        .selectAll("dot")
        .data(weightTime)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return xScale(d.time); } )
        .attr("cy", function (d) { return yScale(d.weight); } )
        .attr("r", 3)
        .attr("transform", "translate(" + 50 + "," + 50 + ")")
        .style("fill", textColor);

        // Line        
        var line = d3.line()
        .x(function(d) { return xScale(d.time); }) 
        .y(function(d) { return yScale(d.weight); }) 
        .curve(d3.curveMonotoneX)
        
        svg.append("path")
        .datum(weightTime) 
        .attr("class", "line") 
        .attr("transform", "translate(" + 50 + "," + 50 + ")")
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", textColor)
        .style("stroke-width", "2");

    // Automatically scroll to the output area after it is output generated
    let anchor = document.createElement('a');
    anchor.setAttribute("href", "#output");
    anchor.click();

    // Show hidden text in output area
    let hiddenText = document.querySelectorAll('.output-text')
    for (let m=0; m<hiddenText.length; m++){
        hiddenText[m].style.display = "block";
    }
    }
  })
    
    