import React, { Component } from 'react'
import MonacoEditor from '@uiw/react-monacoeditor';
import Resizable from 're-resizable';
import Chart from 'react-google-charts';
import { Navbar, NavbarBrand } from 'reactstrap';
import { Row, Col } from 'reactstrap';
import { Button } from 'reactstrap';
import Digestor from '../../controller/DataDigestor';
import Message from '../../component/message/Message'
import string from '../../infrasctuture/strings'
import '../../App.css';

var editor, chart, digestor;

class ChartPlotView extends Component {

    constructor(props) {
        super(props)
        this.state = {
            errorHasOccurred: false,
            errorMessage: ''
        };
        this.state.initialHeight = parseInt(window.innerHeight / 2 - 80);
        this.state.data = require('./data.js').default;
        digestor = new Digestor(this.state.data);
        digestor.digest();
    }

    generateChart = () => {
        var editorData = editor.getValue();
        this.setState({ data: editorData });
        digestor = new Digestor(editorData);
        digestor.digest().then(
            this.onDigestSuccess.bind(this),
            this.onDigestError.bind(this)
        );
    }

    onDigestSuccess(result) {
        this.setState({ errorHasOccurred: false });
        if (chart) chart.draw();
    }

    onDigestError(error) {
        this.setState({ errorHasOccurred: true });
        this.setState({ errorMessage: error });
        console.log('Error: ' + error);
    }

    onResize(e) {
        var rowChart = document.getElementById('rowChart');
        var height = window.innerHeight - e.offsetY - 80;
        height = (height < 150) ? 150 : height;
        rowChart.style.height = height + 'px';
        editor.layout();
    }

    onResizeStop() {
        if (chart) chart.draw();
    }

    editorDidMount(ed) {
        editor = ed;
    }

    chartDidMount(ct) {
        chart = ct;
    }

    render() {
        return (
            <div className="App">
                <Navbar color="faded" light className="navbar">
                    <NavbarBrand className="mr-auto">{string.label_title_challenge}</NavbarBrand>
                </Navbar>
                <Row>
                    <Col>
                        <Resizable
                            style={{ borderBottom: '5px solid #AAAAAA' }}
                            defaultSize={{ width: '100%', height: this.state.initialHeight }}
                            enable={{ top: false, right: false, bottom: true, left: false, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }}
                            onResize={this.onResize}
                            onResizeStop={this.onResizeStop}>
                            <MonacoEditor
                                width="100%"
                                height="100%"
                                language="javascript"
                                value={this.state.data}
                                options={{ theme: 'vs-dark' }}
                                editorDidMount={this.editorDidMount.bind(this)} />
                        </Resizable>
                    </Col>
                </Row>
                <Row id="rowChart" style={{ height: this.state.initialHeight }}>
                    <Col>
                        {!this.state.errorHasOccurred &&
                            <Chart
                                width='100%'
                                height='100%'
                                chartType="LineChart"
                                loader={<div>Loading Chart</div>}
                                data={digestor.value}
                                options={{
                                    chartArea: { left: '5%', width: '70%' },
                                    legend: { position: 'right', textStyle: { fontSize: 14 } },
                                    pointShape: 'circle',
                                    curveType: 'function',
                                    pointSize: 7,
                                    animation: { startup: true, duration: 1000, easing: 'out' }
                                }}
                                getChartWrapper={this.chartDidMount} />}
                        {this.state.errorHasOccurred &&
                            <Message
                                title={string.error_title}
                                message={this.state.errorMessage} />
                        }
                    </Col>
                </Row>
                <Row className="fixed-bottom footer">
                    <Col>
                        <Button color="primary" onClick={this.generateChart}>{string.label_generate_chart}</Button>
                    </Col>
                </Row>
            </div>
        )
    }
}

ChartPlotView.propTypes = {

}

export default ChartPlotView;