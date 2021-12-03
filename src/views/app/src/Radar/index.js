import { ResponsiveRadar } from '@nivo/radar';

function Radar(props) {
    let months = [
        'December',
        // 'November',
        // 'October',
        // 'September',
        // 'August',
        // 'July',
        // 'June',
        // 'May',
        // 'April',
        // 'March',
        // 'February',
        // 'January'
    ]
    return (
    <ResponsiveRadar
        data={props.data}
        keys={months}
        indexBy="emotion"
        valueFormat=">-.2f"
        margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
        borderColor={{ from: 'color' }}
        gridLabelOffset={36}
        dotSize={10}
        dotColor={{ theme: 'background' }}
        dotBorderWidth={2}
        colors={{ scheme: 'paired' }}
        blendMode="multiply"
        motionConfig="wobbly"
        legends={[
            {
                anchor: 'top-right',
                direction: 'column',
                translateX: -300,
                translateY: -40,
                itemWidth: 80,
                itemHeight: 25,
                itemTextColor: '#999',
                symbolSize: 15,
                symbolShape: 'circle',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#000'
                        }
                    }
                ]
            }
        ]}
    />
    )
}
export default Radar;