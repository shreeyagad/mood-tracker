import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
class EmotionForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            error: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.apiClient.createEmotion({"status": this.state.value});
        const date = async () => {  
            await this.props.apiClient.dateExists();
        }; 
        date().then(() => {  
            this.props.showAlert();
        }).catch((error) => {  
            this.props.apiClient.createEmotion({"status": this.state.value});
        });
    }

    render() {
        return (
        <Form onSubmit={this.handleSubmit} style={{marginTop: 50}}>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                {/* <Form.Label>Enter your status for today!</Form.Label> */}
                <Form.Control as="textarea" rows={3} onChange={this.handleChange}/>
            </Form.Group>
            <Button variant="dark" type="submit">Submit</Button>
        </Form>
        );
    }
}

export default EmotionForm;