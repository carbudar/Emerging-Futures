document.addEventListener('DOMContentLoaded', async () => {
    // Header button setup
    const buttons = document.querySelectorAll('.header h3');
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const section = document.querySelector(`.section${index}`);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    //home container
    const numberCounter = document.querySelector('.homePageNumber');
    let counter = 0
    numberCounter.innerHTML = counter

    setInterval(() => {
        counter+=2;
        numberCounter.innerHTML = counter
    }, 1000); // Executes every 1000ms (1 second)

    //documentation container
    const picBtn = document.querySelector('.morePicButton')

    const btnText = document.createElement('h3')

    btnText.innerHTML = "More Images"
    btnText.classList.add('buttonStyling')
    picBtn.appendChild(btnText)

 
    const extraPic = document.querySelector('.extraPic')

let imageIsShowing = false;

picBtn.addEventListener('click', () => {
    imageIsShowing = !imageIsShowing; // Toggle the state
    extraPic.classList.toggle('showPics', imageIsShowing); 

    if (imageIsShowing) {
        btnText.innerHTML = "Hide Images";
    } else {
        btnText.innerHTML = "More Images";
    }
});

    // Graph container
    const graphContainer = document.querySelector('.graph-container');
    const graphTitle = document.querySelector('.graph-title');
    const graphDesc = document.querySelector('.graph-desc');
    const graphText = document.querySelector('.graph-text')
    const graphTextTop = document.querySelector('.graph-text-top');

    //default content
    let mortalityDataIsShowing = false;
    let currentTopic = "Mortality";
    let newTopic = "Birth";
    let clickInstruction;
    graphTitle.innerHTML = `Crude ${currentTopic} Data Graph`;
    graphDesc.innerHTML = `This graph shows the approximate number of ${currentTopic} per 1000 population in each year.`;


    //getting data from json file
    const fetchData = async () => {
        try {
            const response = await fetch('./data.json');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };

    //function to create d3 graph
    const renderGraph = (dataset, years, birthDataset) => {
        const graphContainer = d3.select('#dataGraph');
        graphContainer.selectAll('*').remove(); // Clear existing graph

        // Get the dimensions of the parent container
        const containerWidth = graphContainer.node().offsetWidth;
        const containerHeight = graphContainer.node().offsetHeight;

        const margin = { top: 20, bottom: 30, left: 40, right: 20 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        const svg = graphContainer
            .append('svg')
            .attr('width', containerWidth)
            .attr('height', containerHeight)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const data = years.map(year => ({
            year,
            value: dataset[year],
            birthValue: birthDataset[year]
        }));

        const maxY = Math.max(
            d3.max(data, d => d.value),// Max of mortalityData
            d3.max(data, d => d.birthValue)//max value from birthData
        );

        const x = d3.scaleBand()
            .domain(years)
            .range([0, width])
            .padding(0);

        const y = d3.scaleLinear()
            .domain([0, maxY])
            .range([height, (1/4*height)]);

        svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.year))
            .attr('y', d => y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.value))
            .attr('fill', '#f2ff93')
            .on('mouseover', function (event, d) {
                d3.select(this).transition().duration(50).attr('fill', '#95b1ee');
                svg.append('text')
                    .attr('class', 'hover-text')
                    .attr('x', parseFloat(d3.select(this).attr('x')) + x.bandwidth() / 2)
                    .attr('y', parseFloat(d3.select(this).attr('y')) - 10)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '14px')
                    .attr('fill', '#95b1ee')
                    .text(d.value);
            })
            .on('mouseout', function () {
                d3.select(this).transition().duration(50).attr('fill', '#f2ff93');
                svg.selectAll('.hover-text').remove();
            });

        svg.selectAll('.separator')
        .data(years)
        .enter()
        .append('rect') // Create line separator
        .attr('class', 'separator')
        .attr('x', d => x(d)) // Position by year
        .attr('y', 0) // Start from the top of the container
        .attr('width', x.bandwidth()) // Match the width of the bar
        .attr('height', height) // Full container height
        .attr('fill', 'none') // No fill
        .attr('stroke', '#000') // Light gray stroke
        .attr('stroke-width', 1); // Thin stroke width


        svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x));

        svg.append('g')
            .call(d3.axisLeft(y));
    };

    const data = await fetchData();

    const updateGraph = () => {
        const dataset = mortalityDataIsShowing ? data.birthData : data.mortalityData;
        const birthDataset = data.birthData;
        const years = Object.keys(dataset);
        renderGraph(dataset, years, birthDataset);
    };

    graphContainer.addEventListener('click', () => {
        mortalityDataIsShowing = !mortalityDataIsShowing;
        currentTopic = mortalityDataIsShowing ? "Birth" : "Mortality";
        newTopic = mortalityDataIsShowing ? "Mortality" : "Birth";

        graphTitle.innerHTML = `Crude ${currentTopic} Data Graph`;
        graphDesc.innerHTML = `This graph shows the approximate number of ${currentTopic} per 1000 population in each year.`;

        updateGraph(); // Update graph on topic toggle
    });

    graphText.addEventListener('mouseover', () => {
        if (!clickInstruction) {
            clickInstruction = document.createElement('p');
            clickInstruction.classList.add('click-instruction');
            clickInstruction.innerHTML = `Click anywhere to see crude ${newTopic} data graph`;
            graphTextTop.appendChild(clickInstruction);
        }
    });

    graphText.addEventListener('mouseleave', () => {
        if (clickInstruction) {
            clickInstruction.remove();
            clickInstruction = null;
        }
    });

    // Initial graph rendering
    updateGraph();
});
