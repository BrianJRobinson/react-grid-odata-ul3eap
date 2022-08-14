import React, { Component } from 'react';
import { render } from 'react-dom';
import Hello from './Hello';
import './style.css';
import '@progress/kendo-theme-default';

import {
  Grid,
  GridColumn as Column,
  GridDetailRow,
} from '@progress/kendo-react-grid';
import { toODataString } from '@progress/kendo-data-query';

class DetailComponent extends GridDetailRow {
  render() {
    return (
      <Grid data={this.props.dataItem.details}>
        <Column field="Id" title="ID" width="120px" />
        <Column field="Network" title="Network" />
        <Column field="User" title="User" format="{0:c}" />
      </Grid>
    );
  }
}

class App extends React.Component {
  baseUrl = `http://degen-defi.com/odata/`;
  init = { method: 'GET', accept: 'application/json', headers: {} };

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      dataState: {},
    };
    this.expandChange = this.expandChange.bind(this);
    this.dataStateChange = this.dataStateChange.bind(this);
  }

  expandChange(event) {
    let dataItem = event.dataItem;
    dataItem.expanded = !dataItem.expanded;
    this.forceUpdate();
    if (!dataItem.expanded) {
      return;
    }
    fetch(this.baseUrl + `degenlog`, this.init)
      .then((response) => response.json())
      .then((json) => {
        let data = this.state.categories.slice();
        let index = data.findIndex((d) => d.CategoryID === dataItem.CategoryID);
        data[index].details = json.value;
        this.setState({ categories: data });
      });
  }

  dataStateChange(event) {
    this.setState({
      dataState: event.data,
      categories: this.state.categories,
    });

    fetch(this.baseUrl + `degenlog?` + toODataString(event.data), this.init)
      .then((response) => response.json())
      .then((json) =>
        this.setState({
          categories: json.value,
          dataState: this.state.dataState,
        })
      );
  }

  componentDidMount() {
    fetch(this.baseUrl + `degenlog`, this.init)
      .then((response) => response.json())
      .then((json) => this.setState({ categories: json.value }));
  }

  render() {
    return (
      <div>
        <Grid
          style={{ height: '550px' }}
          data={this.state.categories}
          detail={DetailComponent}
          expandField="expanded"
          expandChange={this.expandChange}
          filterable={true}
          sortable={true}
          pageable={true}
          dataStateChange={this.dataStateChange}
          sort={this.state.dataState.sort}
          filter={this.state.dataState.filter}
        >
          <Column
            field="Id"
            filter="numeric"
            title="ID"
            width="200px"
          />
          <Column field="Network" width="200px" title="Network" />
          <Column field="User" sortable={false} />
        </Grid>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
