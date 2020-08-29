import { useFormState } from "react-use-form-state";
import { Flex } from "reflexbox/styled-components";
import React, { FC, useState } from "react";
import axios from "axios";

import { getAxiosConfig } from "../../utils";
import { useMessage } from "../../hooks";
import { TextInput } from "../Input";
import { APIv2 } from "../../consts";
import { Button } from "../Button";
import Text, { H2 } from "../Text";
import { Col } from "../Layout";
import Icon from "../Icon";

const SettingsInvite: FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useMessage(2000);
  const [formState, { email, label }] = useFormState<{ email: string }>(
    null,
    { withIds: true }
  );

  const onSubmit = async e => {
    e.preventDefault();
    if (loading) return;
    if (!formState.validity.email) {
      return setMessage(formState.errors.email);
    }
    setLoading(true);
    setMessage();
    try {
      const res = await axios.post(
        APIv2.Invite,
        formState.values,
        getAxiosConfig()
      );
      formState.clear();
      setMessage(res.data.message, "green");
    } catch (err) {
      setMessage(err?.response?.data?.error || "Couldn't send the invite.");
    }
    setLoading(false);
  };

  return (
    <Col alignItems="flex-start" maxWidth="100%">
      <H2 mb={4} bold>
        Invite
      </H2>
      <Text mb={4}>Enter the email of the user you want to invite.</Text>
      <Flex as="form" onSubmit={onSubmit}>
        <TextInput
          {...email("email")}
          placeholder="Email address..."
          width={[1, 2 / 3]}
          mr={3}
          required
        />
        <Button type="submit" disabled={loading}>
          <Icon name={loading ? "spinner" : "refresh"} mr={2} stroke="white" />
          {loading ? "Inviting..." : "Invite"}
        </Button>
      </Flex>
      <Text color={message.color} mt={3} fontSize={15}>
        {message.text}
      </Text>
    </Col>
  );
};

export default SettingsInvite;
