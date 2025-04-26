import { useState } from "react";
import { Button, Card, InputNumber, Space, Typography } from "antd";

const { Title } = Typography;

interface CounterProps {
  initialValue?: number;
  title?: string;
}

const Counter = ({ initialValue = 0, title = "Counter" }: CounterProps) => {
  const [count, setCount] = useState(initialValue);
  const [step, setStep] = useState(1);

  const handleIncrement = () => {
    setCount((prev) => prev + step);
  };

  const handleDecrement = () => {
    setCount((prev) => prev - step);
  };

  const handleReset = () => {
    setCount(initialValue);
  };

  return (
    <Card title={title} style={{ width: "100%", marginBottom: 16 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={3} style={{ margin: 0, textAlign: "center" }}>
          {count}
        </Title>

        <Space.Compact style={{ width: "100%" }}>
          <Button
            type="primary"
            onClick={handleDecrement}
            style={{ width: "33%" }}
          >
            -
          </Button>
          <Button type="primary" onClick={handleReset} style={{ width: "34%" }}>
            Reset
          </Button>
          <Button
            type="primary"
            onClick={handleIncrement}
            style={{ width: "33%" }}
          >
            +
          </Button>
        </Space.Compact>

        <Space align="center" style={{ width: "100%" }}>
          <Typography.Text>Step:</Typography.Text>
          <InputNumber
            min={1}
            max={100}
            value={step}
            onChange={(value) => setStep(value || 1)}
            style={{ width: 80 }}
          />
        </Space>
      </Space>
    </Card>
  );
};

export default Counter;
