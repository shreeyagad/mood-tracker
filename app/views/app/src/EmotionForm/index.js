import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
class EmotionForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        this.props.apiClient.createEmotion({"status": this.state.value});
        this.props.updateState();
    }

    render() {
        return (
        <Form onSubmit={this.handleSubmit}>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                <Form.Label>Enter your status for today!</Form.Label>
                <Form.Control as="textarea" rows={3} onChange={this.handleChange}/>
            </Form.Group>
            <Button variant="dark" type="submit">
                Submit
            </Button>
        </Form>
        );
    }
}

export default EmotionForm;