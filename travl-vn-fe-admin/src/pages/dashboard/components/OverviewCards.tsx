import { Row, Col, Card, Statistic } from 'antd';

export default function OverviewCards() {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card>
          <Statistic title="Revenue (today)" value="$2,340" />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic title="New Orders" value={27} />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic title="Open Tickets" value={5} />
        </Card>
      </Col>
    </Row>
  );
}
