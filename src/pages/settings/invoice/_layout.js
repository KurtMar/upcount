import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Field, reduxForm } from 'redux-form';
import { Button, Col, Form, Layout, Row, Select, Upload } from 'antd';
import { FileTextOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons';
import { Trans } from '@lingui/macro';
import { get, map } from 'lodash';

import currencyToSymbolMap from 'currency-symbol-map/map';

import { AInput, AInputNumber, ASelect, ATextarea } from '../../../components/forms/fields';

class Settings extends Component {
  componentDidMount() {
    this.props.dispatch({ type: 'taxRates/list' });
    this.props.dispatch({
      type: 'organizations/initialize',
      payload: {
        id: localStorage.getItem('organization'),
      },
    });
    this.props.dispatch({
      type: 'organizations/getLogo',
      payload: {
        id: localStorage.getItem('organization'),
      },
    });
  }

  handleLogoUpload = data => {
    const { organizations } = this.props;
    const organization = get(organizations.items, localStorage.getItem('organization'));

    this.props.dispatch({
      type: 'organizations/setLogo',
      payload: {
        _id: get(organization, '_id'),
        _rev: get(organization, '_rev'),
        file: get(data, 'file'),
      },
    });
  };

  render() {
    const { handleSubmit, pristine, submitting, organizations } = this.props;
    const logo = get(organizations.logos, localStorage.getItem('organization'));
    const { ipcRenderer } = window.require('electron');

    return (
      <Layout.Content>
        <Form layout="vertical" onFinish={() => handleSubmit()}>
          <Row gutter={32}>
            <Col span={12}>
              <h2>
                <FileTextOutlined />
                {` `}
                <Trans>Invoice details</Trans>
              </h2>
              <Field
                showSearch
                name="currency"
                component={ASelect}
                label={<Trans>Default currency</Trans>}
                style={{ width: '100%' }}
              >
                {map(currencyToSymbolMap, (symbol, currency) => (
                  <Select.Option value={currency} key={currency}>
                    {`${currency} ${symbol}`}
                  </Select.Option>
                ))}
              </Field>
              <Field
                name="minimum_fraction_digits"
                min={0}
                max={10}
                component={AInputNumber}
                label={<Trans>Decimal places</Trans>}
              />
              <Field
                name="date_format"
                min={0}
                max={20}
                component={AInput}
                label={
                  <div>
                    <Trans>Date format</Trans> (
                    <a onClick={() => ipcRenderer.send('openLink', 'https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/')} target="_blank">
                      https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/
                    </a>
                    )
                  </div>
              } />
              <Field name="due_days" component={AInput} label={<Trans>Due days</Trans>} />
              <Field
                name="overdue_charge"
                component={AInput}
                label={<Trans>Overdue charge</Trans>}
              />
              <Field name="notes" component={ATextarea} label={<Trans>Notes</Trans>} rows={4} />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={pristine || submitting}
                loading={submitting}
                style={{ marginBottom: 40 }}
              >
                <Trans>Save</Trans>
              </Button>
            </Col>
          </Row>
        </Form>
        <Row>
          <Col span={12}>
            <h2>
              <PictureOutlined />
              {` `}
              <Trans>Logo</Trans>
            </h2>
            {logo ? <img src={logo} alt="logo" style={{ maxWidth: 250, maxHeight: 250 }} /> : ''}
            <br />
            <Upload
              accept="image/*"
              showUploadList={false}
              customRequest={data => this.handleLogoUpload(data)}
            >
              <Button style={{ marginTop: 20 }}>
                <UploadOutlined /> {logo ? <Trans>Change</Trans> : <Trans>Upload</Trans>}
              </Button>
            </Upload>
          </Col>
        </Row>
      </Layout.Content>
    );
  }
}

export default compose(
  connect(state => ({
    organizations: state.organizations,
  })),
  reduxForm({
    form: 'organization',
    onSubmit: async (data, dispatch) => {
      return new Promise((resolve, reject) => {
        dispatch({ type: 'organizations/save', data: data, resolve, reject });
      });
    },
    onSubmitSuccess: (result, dispatch) => {
      dispatch({
        type: 'organizations/initialize',
        payload: {
          id: localStorage.getItem('organization'),
        },
      });
    },
  })
)(Settings);
