import { ResponsivePie } from '@nivo/pie'

function PieChart(props) {
    return (
    <ResponsivePie
        data={props.data}
        margin={{ top: 40, right: 40, bottom: 80, left: 40 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: 'color', modifiers: [ [ 'darker', 2 ] ] }}
        defs={[
            {
                id: 'dots',
                type: 'patternDots',
                background: 'inherit',
                color: 'rgba(255, 255, 255, 0.3)',
                size: 4,
                padding: 1,
                stagger: true
            },
            {
                id: 'lines',
                type: 'patternLines',
                background: 'inherit',
                color: 'rgba(255, 255, 255, 0.3)',
                rotation: -45,
                lineWidth: 6,
                spacing: 10
            }
        ]}
        fill={[
            {
                match: {
                    id: 'Fear'
                },
                id: 'dots'
            },
            {
                match: {
                    id: 'Joy'
                },
                id: 'dots'
            },
            {
                match: {
                    id: 'Surprise'
                },
                id: 'dots'
            },
            {
                match: {
                    id: 'Love'
                },
                id: 'dots'
            },
            {
                match: {
                    id: 'Anger'
                },
                id: 'lines'
            },
            {
                match: {
                    id: 'Sadness'
                },
                id: 'lines'
            },
        ]}
        legends={[
            {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 70,
                itemsSpacing: 12,
                itemWidth: 60,
                itemHeight: 25,
                itemTextColor: '#999',
                itemDirection: 'left-to-right',
                itemOpacity: 1,
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
export default PieChart;